/**
 * Dev-mode diagnostic logging.
 * Enabled by setting localStorage "ab-dev" to any value.
 */

const IS_DEV: boolean = (() => {
    try {
        return localStorage.getItem("ab-dev") !== null;
    } catch {
        return false;
    }
})();

/** Log a diagnostic message in dev mode only. */
export function diag(...args: unknown[]): void {
    if (IS_DEV) {
        console.log("[Companion]", ...args);
    }
}
