/**
 * FinanceApiClient
 *
 * Pure HTTP communication layer for the AgencyBooster Finance API.
 * Responsibilities:
 *   - Construct the Finance request URL
 *   - Execute fetch() with same-origin cookies
 *   - Validate HTTP response status
 *   - Parse and validate JSON response
 *   - Return raw parsed JSON
 *
 * Non-responsibilities:
 *   - Business logic, caching, persistence, UI, Controller, Widget, Shift logic
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Raw finance API response shape (as returned by the server). */
export interface FinanceApiResponse {
    [key: string]: unknown;
}

/** Configuration for a single FinanceApiClient instance. */
export interface FinanceApiClientConfig {
    /** Base path for the AgencyHelper endpoint. */
    readonly basePath?: string;
    /** Default timeout in milliseconds. Fetch will be aborted after this duration. */
    readonly timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Typed Errors
// ---------------------------------------------------------------------------

/** Base class for all FinanceApiClient errors. */
export class FinanceApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "FinanceApiError";
    }
}

/** The request was aborted (timeout or explicit AbortController). */
export class FinanceApiAbortError extends FinanceApiError {
    constructor(reason: string = "Request aborted") {
        super(reason);
        this.name = "FinanceApiAbortError";
    }
}

/** HTTP response status was not 2xx. */
export class FinanceApiHttpError extends FinanceApiError {
    public readonly status: number;
    public readonly statusText: string;
    public readonly body: string;

    constructor(status: number, statusText: string, body: string) {
        super(`HTTP ${status} ${statusText}`);
        this.name = "FinanceApiHttpError";
        this.status = status;
        this.statusText = statusText;
        this.body = body;
    }
}

/** Response body could not be parsed as JSON. */
export class FinanceApiParseError extends FinanceApiError {
    public readonly body: string;

    constructor(message: string, body: string) {
        super(message);
        this.name = "FinanceApiParseError";
        this.body = body;
    }
}

/** Server returned a structured error object. */
export class FinanceApiServerError extends FinanceApiError {
    public readonly serverError: unknown;

    constructor(message: string, serverError: unknown) {
        super(message);
        this.name = "FinanceApiServerError";
        this.serverError = serverError;
    }
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_BASE_PATH = "/usermodule/services/agencyhelper/v2";
const DEFAULT_TIMEOUT_MS = 30_000;

// ---------------------------------------------------------------------------
// FinanceApiClient
// ---------------------------------------------------------------------------

export class FinanceApiClient {
    private readonly basePath: string;
    private readonly defaultTimeoutMs: number;

    constructor(config: FinanceApiClientConfig = {}) {
        this.basePath = config.basePath ?? DEFAULT_BASE_PATH;
        this.defaultTimeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    }

    /**
     * Fetch finance transactions for the given date range.
     *
     * @param from - Start date (inclusive). Will be formatted as YYYY-MM-DD.
     * @param to   - End date (inclusive). Will be formatted as YYYY-MM-DD.
     * @param options - Optional: AbortSignal, custom timeout.
     * @returns The raw parsed JSON response from the server.
     * @throws {FinanceApiAbortError}    If the request was aborted.
     * @throws {FinanceApiHttpError}     If the HTTP status is not 2xx.
     * @throws {FinanceApiParseError}    If the response body is not valid JSON.
     * @throws {FinanceApiServerError}   If the server returned a structured error.
     */
    async fetchTransactions(
        from: Date,
        to: Date,
        options?: { signal?: AbortSignal; timeoutMs?: number }
    ): Promise<FinanceApiResponse> {
        const url = this.buildUrl(from, to);
        const timeoutMs = options?.timeoutMs ?? this.defaultTimeoutMs;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        // Link external signal to our internal controller
        if (options?.signal) {
            if (options.signal.aborted) {
                clearTimeout(timeoutId);
                throw new FinanceApiAbortError("Signal already aborted");
            }
            options.signal.addEventListener("abort", () => controller.abort(), { once: true });
        }

        try {
            const response = await fetch(url, {
                method: "GET",
                credentials: "same-origin",
                signal: controller.signal,
                headers: {
                    "Accept": "application/json",
                },
            });

            clearTimeout(timeoutId);

            // Validate HTTP status
            if (!response.ok) {
                const body = await response.text().catch(() => "");
                throw new FinanceApiHttpError(response.status, response.statusText, body);
            }

            // Read body as text first to handle parse errors gracefully
            const text = await response.text();

            // Validate JSON
            let data: unknown;
            try {
                data = JSON.parse(text);
            } catch {
                throw new FinanceApiParseError(
                    `Response is not valid JSON (${text.length} chars)`,
                    text
                );
            }

            // Validate structure: server may return { error: "...", success: false }
            if (this.isServerError(data)) {
                throw new FinanceApiServerError(
                    `Server error: ${this.extractServerError(data)}`,
                    data
                );
            }

            return data as FinanceApiResponse;

        } catch (error: unknown) {
            clearTimeout(timeoutId);

            // Re-throw our own errors directly
            if (error instanceof FinanceApiError) {
                throw error;
            }

            // AbortError from fetch (triggered by AbortController)
            if (error instanceof DOMException && error.name === "AbortError") {
                throw new FinanceApiAbortError("Request timed out or was aborted");
            }

            // Network errors (TypeError from fetch when offline, DNS failure, etc.)
            if (error instanceof TypeError) {
                throw new FinanceApiError(`Network error: ${error.message}`);
            }

            // Anything else
            throw new FinanceApiError(
                `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    /**
     * Build the full request URL with date parameters.
     * Uses relative URL so the browser includes cookies automatically.
     */
    private buildUrl(from: Date, to: Date): string {
        const fromStr = this.formatDate(from);
        const toStr = this.formatDate(to);
        return `${this.basePath}?command=finances&from=${fromStr}&to=${toStr}`;
    }

    /**
     * Format a Date as YYYY-MM-DD for the API.
     */
    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    /**
     * Check if a parsed response looks like a server error object.
     */
    private isServerError(data: unknown): boolean {
        if (typeof data !== "object" || data === null) return false;
        const obj = data as Record<string, unknown>;
        return "error" in obj && "success" in obj && obj.success === false;
    }

    /**
     * Extract the error message from a server error object.
     */
    private extractServerError(data: unknown): string {
        if (typeof data !== "object" || data === null) return "Unknown server error";
        const obj = data as Record<string, unknown>;
        return typeof obj.error === "string" ? obj.error : "Unknown server error";
    }
}
