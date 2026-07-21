/**
 * FinanceController
 *
 * Orchestrates Finance data flow: owns state, triggers requests,
 * manages cancellation, and notifies subscribers.
 *
 * Non-responsibilities:
 *   - HTTP communication (see FinanceApiClient)
 *   - Response mapping (see FinanceMapper)
 *   - Business logic, caching, persistence, UI
 */

import { FinanceApiClient, FinanceApiError, FinanceApiAbortError } from "./finance-api-client";
import { FinanceMapper, FinanceResponse } from "./finance-mapper";
import { FinanceShift, ShiftType } from "./finance-shift";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Finance controller state. */
export interface FinanceState {
    readonly status: FinanceStatus;
    readonly data: FinanceResponse | null;
    readonly error: string | null;
    readonly from: Date;
    readonly to: Date;
    readonly shift: ShiftType;
}

/** Finance controller status. */
export type FinanceStatus = "idle" | "loading" | "loaded" | "error";

/** Callback for state changes. */
export type FinanceStateListener = (state: FinanceState) => void;

/** Configuration for FinanceController. */
export interface FinanceControllerConfig {
    readonly shift?: ShiftType;
    readonly timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// FinanceController
// ---------------------------------------------------------------------------

export class FinanceController {
    private state: FinanceState;
    private readonly listeners: Set<FinanceStateListener> = new Set();
    private readonly client: FinanceApiClient;
    private readonly timeoutMs: number;
    private abortController: AbortController | null = null;

    constructor(config: FinanceControllerConfig = {}) {
        const shift = config.shift ?? FinanceShift.getSavedOrDetect();
        const range = FinanceShift.computeDateRange(shift);

        this.state = {
            status: "idle",
            data: null,
            error: null,
            from: range.from,
            to: range.to,
            shift,
        };

        this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.client = new FinanceApiClient({ timeoutMs: this.timeoutMs });
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /** Get current state (immutable snapshot). */
    getState(): FinanceState {
        return { ...this.state };
    }

    /** Get the current shift type. */
    getCurrentShift(): ShiftType {
        return this.state.shift;
    }

    /**
     * Set the active shift and optionally refresh.
     * Computes the correct date range and persists the selection.
     *
     * @param shift - The shift type to activate.
     * @param autoRefresh - If true, automatically fetch after setting shift. Default: true.
     */
    setShift(shift: ShiftType, autoRefresh: boolean = true): void {
        if (this.state.shift === shift) {
            // Same shift — just refresh if requested
            if (autoRefresh) {
                this.refresh();
            }
            return;
        }

        this.cancelPending();
        FinanceShift.save(shift);

        const range = FinanceShift.computeDateRange(shift);
        this.setState({
            shift,
            from: range.from,
            to: range.to,
            data: null,
            status: "idle",
            error: null,
        });

        if (autoRefresh) {
            this.refresh();
        }
    }

    /**
     * Fetch finance data for the current date range.
     * Cancels any in-flight request before starting a new one.
     */
    async refresh(): Promise<void> {
        this.cancelPending();
        this.setState({ status: "loading", error: null });

        const controller = new AbortController();
        this.abortController = controller;

        try {
            const raw = await this.client.fetchTransactions(
                this.state.from,
                this.state.to,
                {
                    signal: controller.signal,
                    timeoutMs: this.timeoutMs,
                }
            );

            if (controller.signal.aborted) {
                return;
            }

            const mapped = FinanceMapper.mapResponse(raw);
            this.setState({ status: "loaded", data: mapped, error: null });
        } catch (error: unknown) {
            if (controller.signal.aborted) {
                return;
            }

            if (error instanceof FinanceApiAbortError) {
                this.setState({ status: "error", error: "Request timed out" });
            } else if (error instanceof FinanceApiError) {
                this.setState({ status: "error", error: error.message });
            } else if (error instanceof Error) {
                this.setState({ status: "error", error: error.message });
            } else {
                this.setState({ status: "error", error: "Unknown error" });
            }
        } finally {
            if (this.abortController === controller) {
                this.abortController = null;
            }
        }
    }

    /**
     * Set the date range and optionally refresh.
     * Cancels any in-flight request.
     *
     * @param from - Start date (inclusive).
     * @param to   - End date (inclusive).
     * @param autoRefresh - If true, automatically fetch after setting dates. Default: false.
     */
    setDateRange(from: Date, to: Date, autoRefresh: boolean = false): void {
        this.cancelPending();
        this.setState({ from, to, data: null, status: "idle", error: null });

        if (autoRefresh) {
            this.refresh();
        }
    }

    /** Cancel any in-flight request. */
    cancelPending(): void {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    /** Check if a request is in progress. */
    get isLoading(): boolean {
        return this.state.status === "loading";
    }

    /** Subscribe to state changes. Returns an unsubscribe function. */
    subscribe(listener: FinanceStateListener): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    /** Unsubscribe from state changes. */
    unsubscribe(listener: FinanceStateListener): void {
        this.listeners.delete(listener);
    }

    /** Get the number of active subscribers. */
    get subscriberCount(): number {
        return this.listeners.size;
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    private setState(partial: Partial<FinanceState>): void {
        this.state = { ...this.state, ...partial };
        this.notify();
    }

    private notify(): void {
        for (const listener of this.listeners) {
            try {
                listener(this.state);
            } catch {
                // Listener threw — skip, don't break other listeners
            }
        }
    }
}
