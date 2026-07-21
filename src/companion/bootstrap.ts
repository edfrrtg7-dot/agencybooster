/**
 * Finance Companion Bootstrap
 *
 * Entry point that creates FinanceController and FinanceWidget.
 * This file is the only one that should reference both controller and widget.
 *
 * TODO: Remove floating launcher after Companion Manage integration.
 */

import { FinanceController } from "./finance-controller";
import { FinanceWidget } from "./finance-widget";
import { FINANCE_WIDGET_CSS } from "./finance-widget.css";

function injectStyles(): void {
    const style = document.createElement("style");
    style.id = "ab-finance-styles";
    style.textContent = FINANCE_WIDGET_CSS;
    document.head.appendChild(style);
}

/**
 * Create a floating launcher button to reopen the Finance widget.
 * TODO: Remove this function after Companion Manage integration.
 */
function createReopenButton(widget: FinanceWidget): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.id = "ab-finance-reopen";
    btn.title = "Open Finance";
    btn.textContent = "Finance";
    btn.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 24px;
        z-index: 2147483645;
        background: #2F6BFF;
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: none;
    `;
    btn.addEventListener("click", () => {
        widget.show();
        btn.style.display = "none";
    });
    document.body.appendChild(btn);
    return btn;
}

function bootstrap(): void {
    // Wait for DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bootstrap);
        return;
    }

    // Guard: only run once
    if ((window as any).__AB_FINANCE_COMPANION__) return;
    (window as any).__AB_FINANCE_COMPANION__ = true;

    // Guard: top frame only
    if (window !== window.top) return;

    // Inject CSS
    injectStyles();

    // Create controller
    const controller = new FinanceController();

    // Create reopen button (hidden by default)
    let reopenBtn: HTMLButtonElement | null = null;

    // Create widget with close callback
    const widget = new FinanceWidget(controller, {
        onClose: () => {
            if (!reopenBtn) {
                reopenBtn = createReopenButton(widget);
            }
            reopenBtn.style.display = "block";
        },
    });
}

bootstrap();
