/**
 * FinanceWidget
 *
 * DOM-based widget that displays live finance data from FinanceController.
 * Subscribes to state changes and renders loading/error/loaded states.
 * Includes a shift selector for Morning / Day / Night intervals.
 *
 * Non-responsibilities:
 *   - HTTP communication (see FinanceApiClient)
 *   - Response mapping (see FinanceMapper)
 *   - State management (see FinanceController)
 *   - Business logic, caching, persistence
 */

import { FinanceController, FinanceState, FinanceStateListener } from "./finance-controller";
import { FinanceTransaction } from "./finance-mapper";
import { FinanceShift, ShiftType, ShiftDefinition } from "./finance-shift";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Configuration for FinanceWidget. */
export interface FinanceWidgetConfig {
    /** Target element to append the widget to. Default: document.body. */
    readonly container?: HTMLElement;
    /** CSS class prefix. Default: "ab-finance". */
    readonly classPrefix?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_CLASS_PREFIX = "ab-finance";

// ---------------------------------------------------------------------------
// FinanceWidget
// ---------------------------------------------------------------------------

export class FinanceWidget {
    private readonly controller: FinanceController;
    private readonly container: HTMLElement;
    private readonly classPrefix: string;
    private readonly unsubscribe: () => void;
    private root: HTMLDivElement | null = null;
    private refreshBtn: HTMLButtonElement | null = null;
    private shiftBtn: HTMLButtonElement | null = null;
    private shiftDropdown: HTMLDivElement | null = null;
    private contentEl: HTMLDivElement | null = null;
    private destroyed = false;

    constructor(controller: FinanceController, config: FinanceWidgetConfig = {}) {
        this.controller = controller;
        this.container = config.container ?? document.body;
        this.classPrefix = config.classPrefix ?? DEFAULT_CLASS_PREFIX;

        this.unsubscribe = this.controller.subscribe(this.onStateChange);
        this.render(this.controller.getState());
        this.controller.refresh();
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /** Remove the widget from the DOM and unsubscribe from the controller. */
    destroy(): void {
        if (this.destroyed) return;
        this.destroyed = true;
        this.unsubscribe();
        this.controller.cancelPending();
        this.root?.remove();
        this.root = null;
        this.refreshBtn = null;
        this.shiftBtn = null;
        this.shiftDropdown = null;
        this.contentEl = null;
    }

    /** Check if the widget has been destroyed. */
    get isDestroyed(): boolean {
        return this.destroyed;
    }

    // -------------------------------------------------------------------------
    // State rendering
    // -------------------------------------------------------------------------

    private onStateChange: FinanceStateListener = (state) => {
        if (this.destroyed) return;
        this.render(state);
    };

    private render(state: FinanceState): void {
        if (!this.root) {
            this.createRoot();
        }

        this.updateRefreshButton(state.status);
        this.updateShiftButton(state.shift);
        this.updateContent(state);
    }

    // -------------------------------------------------------------------------
    // DOM creation
    // -------------------------------------------------------------------------

    private createRoot(): void {
        const root = document.createElement("div");
        root.className = this.classPrefix;
        root.id = `${this.classPrefix}-widget`;

        // Header
        const header = document.createElement("div");
        header.className = `${this.classPrefix}-header`;

        // Shift selector
        const shiftArea = document.createElement("div");
        shiftArea.className = `${this.classPrefix}-shift-area`;

        const shiftBtn = document.createElement("button");
        shiftBtn.className = `${this.classPrefix}-shift-btn`;
        shiftBtn.title = "Select shift";
        shiftBtn.addEventListener("click", this.onShiftToggle);

        const shiftDropdown = document.createElement("div");
        shiftDropdown.className = `${this.classPrefix}-shift-dropdown`;
        shiftDropdown.style.display = "none";

        for (const def of FinanceShift.getAllDefinitions()) {
            const option = document.createElement("button");
            option.className = `${this.classPrefix}-shift-option`;
            option.dataset.shift = def.type;
            option.innerHTML = `<span class="${this.classPrefix}-shift-name">${def.label}</span><span class="${this.classPrefix}-shift-time">${def.timeDisplay}</span>`;
            option.addEventListener("click", this.onShiftSelect);
            shiftDropdown.appendChild(option);
        }

        shiftArea.appendChild(shiftBtn);
        shiftArea.appendChild(shiftDropdown);

        // Actions
        const actions = document.createElement("div");
        actions.className = `${this.classPrefix}-header-actions`;

        const refreshBtn = document.createElement("button");
        refreshBtn.className = `${this.classPrefix}-btn`;
        refreshBtn.title = "Refresh";
        refreshBtn.textContent = "↻";
        refreshBtn.addEventListener("click", this.onRefreshClick);

        actions.appendChild(refreshBtn);
        header.appendChild(shiftArea);
        header.appendChild(actions);

        // Content
        const content = document.createElement("div");
        content.className = `${this.classPrefix}-body`;

        root.appendChild(header);
        root.appendChild(content);

        this.root = root;
        this.refreshBtn = refreshBtn;
        this.shiftBtn = shiftBtn;
        this.shiftDropdown = shiftDropdown;
        this.contentEl = content;

        this.container.appendChild(root);
    }

    // -------------------------------------------------------------------------
    // State-based rendering
    // -------------------------------------------------------------------------

    private updateRefreshButton(status: string): void {
        if (!this.refreshBtn) return;
        this.refreshBtn.disabled = status === "loading";
        this.refreshBtn.textContent = status === "loading" ? "…" : "↻";
    }

    private updateShiftButton(shift: ShiftType): void {
        if (!this.shiftBtn || !this.shiftDropdown) return;
        const def = FinanceShift.getDefinition(shift);
        this.shiftBtn.textContent = `${def.label} ▾`;

        // Update active state in dropdown
        const options = this.shiftDropdown.querySelectorAll(`.${this.classPrefix}-shift-option`);
        options.forEach((opt) => {
            const htmlOpt = opt as HTMLElement;
            if (htmlOpt.dataset.shift === shift) {
                htmlOpt.classList.add("active");
            } else {
                htmlOpt.classList.remove("active");
            }
        });
    }

    private updateContent(state: FinanceState): void {
        if (!this.contentEl) return;

        switch (state.status) {
            case "idle":
                this.renderIdle();
                break;
            case "loading":
                this.renderLoading();
                break;
            case "loaded":
                this.renderLoaded(state);
                break;
            case "error":
                this.renderError(state);
                break;
        }
    }

    private renderIdle(): void {
        if (!this.contentEl) return;
        this.contentEl.innerHTML = "";
        const message = this.createMessage("Ready to load finance data.");
        this.contentEl.appendChild(message);
    }

    private renderLoading(): void {
        if (!this.contentEl) return;
        this.contentEl.innerHTML = "";
        const message = this.createMessage("Loading…");
        this.contentEl.appendChild(message);
    }

    private renderLoaded(state: FinanceState): void {
        if (!this.contentEl) return;
        this.contentEl.innerHTML = "";

        const def = FinanceShift.getDefinition(state.shift);
        const dateRange = FinanceShift.computeDateRange(state.shift);

        // Shift info row
        const shiftRow = document.createElement("div");
        shiftRow.className = `${this.classPrefix}-row`;

        const shiftLabel = document.createElement("span");
        shiftLabel.className = `${this.classPrefix}-label`;
        shiftLabel.textContent = def.label;

        const shiftTime = document.createElement("span");
        shiftTime.className = `${this.classPrefix}-value`;
        shiftTime.textContent = def.timeDisplay;

        shiftRow.appendChild(shiftLabel);
        shiftRow.appendChild(shiftTime);

        // Date row
        const dateRow = document.createElement("div");
        dateRow.className = `${this.classPrefix}-row`;

        const dateLabel = document.createElement("span");
        dateLabel.className = `${this.classPrefix}-label`;
        dateLabel.textContent = "Date";

        const dateValue = document.createElement("span");
        dateValue.className = `${this.classPrefix}-value`;
        dateValue.textContent = FinanceShift.formatDate(dateRange.from);

        dateRow.appendChild(dateLabel);
        dateRow.appendChild(dateValue);

        // Total row
        const totalRow = document.createElement("div");
        totalRow.className = `${this.classPrefix}-row`;

        const totalLabel = document.createElement("span");
        totalLabel.className = `${this.classPrefix}-label`;
        totalLabel.textContent = "Total";

        const totalValue = document.createElement("span");
        totalValue.className = `${this.classPrefix}-value ${this.classPrefix}-accent`;
        totalValue.textContent = state.data?.total?.toLocaleString() ?? "—";

        totalRow.appendChild(totalLabel);
        totalRow.appendChild(totalValue);

        // Divider
        const divider = document.createElement("div");
        divider.className = `${this.classPrefix}-divider`;

        // Transaction list
        const transactions = state.data?.list ?? [];

        this.contentEl.appendChild(shiftRow);
        this.contentEl.appendChild(dateRow);
        this.contentEl.appendChild(totalRow);
        this.contentEl.appendChild(divider);

        if (transactions.length === 0) {
            const empty = this.createMessage("No transactions found.");
            this.contentEl.appendChild(empty);
        } else {
            const txContainer = document.createElement("div");
            txContainer.className = `${this.classPrefix}-tx-container`;

            // Header row
            const headerRow = document.createElement("div");
            headerRow.className = `${this.classPrefix}-tx-header`;
            headerRow.appendChild(this.createTxCell("Date"));
            headerRow.appendChild(this.createTxCell("Time"));
            headerRow.appendChild(this.createTxCell("Op"));
            headerRow.appendChild(this.createTxCell("User"));
            headerRow.appendChild(this.createTxCell("Cr"));
            txContainer.appendChild(headerRow);

            // Transaction rows
            for (const tx of transactions) {
                txContainer.appendChild(this.createTransactionRow(tx));
            }

            this.contentEl.appendChild(txContainer);
        }
    }

    private renderError(state: FinanceState): void {
        if (!this.contentEl) return;
        this.contentEl.innerHTML = "";

        const errorEl = document.createElement("div");
        errorEl.className = `${this.classPrefix}-error`;
        errorEl.textContent = state.error ?? "Unknown error";

        this.contentEl.appendChild(errorEl);
    }

    // -------------------------------------------------------------------------
    // Transaction row
    // -------------------------------------------------------------------------

    private createTransactionRow(tx: FinanceTransaction): HTMLDivElement {
        const row = document.createElement("div");
        row.className = `${this.classPrefix}-tx-row`;

        const dateStr = tx.date.toLocaleDateString("uk-UA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

        const timeStr = tx.date.toLocaleTimeString("uk-UA", {
            hour: "2-digit",
            minute: "2-digit",
        });

        row.appendChild(this.createTxCell(dateStr));
        row.appendChild(this.createTxCell(timeStr));
        row.appendChild(this.createTxCell(tx.operation, true));
        row.appendChild(this.createTxCell(String(tx.userID)));
        row.appendChild(this.createTxCell(tx.sum.toLocaleString()));

        return row;
    }

    private createTxCell(text: string, isOp: boolean = false): HTMLSpanElement {
        const cell = document.createElement("span");
        cell.className = `${this.classPrefix}-tx-cell${isOp ? ` ${this.classPrefix}-tx-op` : ""}`;
        cell.textContent = text;
        return cell;
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private createMessage(text: string): HTMLDivElement {
        const el = document.createElement("div");
        el.className = `${this.classPrefix}-message`;
        el.textContent = text;
        return el;
    }

    private onRefreshClick = (): void => {
        if (this.destroyed) return;
        this.controller.refresh();
    };

    private onShiftToggle = (): void => {
        if (this.destroyed || !this.shiftDropdown) return;
        const isVisible = this.shiftDropdown.style.display !== "none";
        this.shiftDropdown.style.display = isVisible ? "none" : "flex";
    };

    private onShiftSelect = (event: Event): void => {
        if (this.destroyed) return;
        const target = event.currentTarget as HTMLElement;
        const shift = target.dataset.shift as ShiftType | undefined;
        if (shift && (shift === "morning" || shift === "day" || shift === "night")) {
            this.controller.setShift(shift);
            if (this.shiftDropdown) {
                this.shiftDropdown.style.display = "none";
            }
        }
    };
}
