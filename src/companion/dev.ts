/**
 * Dev-mode diagnostic logging.
 *
 * Centralized diagnostics with severity levels:
 *   - INFO: informational messages
 *   - WARN: warning messages
 *   - ERROR: error messages
 *   - DEBUG: verbose debug messages
 *
 * Enabled by setting localStorage "ab-dev" to any value.
 * No production console logging.
 */

import { StorageService } from "./storage-service";
import { STORAGE_KEYS } from "./storage-keys";

/** Diagnostic severity levels. */
export enum DiagnosticLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    DEBUG = "DEBUG",
}

/** Check if dev mode is active. */
const IS_DEV: boolean = (() => {
    try {
        // Prefer StorageService (respects chrome.storage if available)
        return StorageService.get(STORAGE_KEYS.DEV_MODE) !== null;
    } catch {
        try {
            // Fallback to direct localStorage
            return localStorage.getItem(STORAGE_KEYS.DEV_MODE) !== null;
        } catch {
            return false;
        }
    }
})();

/** Format a diagnostic message with level and timestamp. */
function format(level: DiagnosticLevel, _args: unknown[]): string {
    const timestamp = new Date().toISOString().slice(11, 23);
    return `[Companion:${level}] ${timestamp}`;
}

/**
 * Log an informational diagnostic message in dev mode only.
 */
export function diag(...args: unknown[]): void {
    if (IS_DEV) {
        console.log(format(DiagnosticLevel.INFO, args), ...args);
    }
}

/**
 * Log a warning diagnostic message in dev mode only.
 */
export function diagWarn(...args: unknown[]): void {
    if (IS_DEV) {
        console.warn(format(DiagnosticLevel.WARN, args), ...args);
    }
}

/**
 * Log an error diagnostic message in dev mode only.
 */
export function diagError(...args: unknown[]): void {
    if (IS_DEV) {
        console.error(format(DiagnosticLevel.ERROR, args), ...args);
    }
}

/**
 * Log a debug diagnostic message in dev mode only.
 */
export function diagDebug(...args: unknown[]): void {
    if (IS_DEV) {
        console.debug(format(DiagnosticLevel.DEBUG, args), ...args);
    }
}

/**
 * Check if dev mode is active.
 * Useful for conditional expensive logging.
 */
export function isDevMode(): boolean {
    return IS_DEV;
}
