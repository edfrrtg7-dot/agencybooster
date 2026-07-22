/**
 * Companion Bootstrap
 *
 * Single entry point for the Companion application.
 * Creates CompanionApp, registers Finance module, starts the app.
 *
 * Responsibilities:
 *   - Wait for DOM ready
 *   - Prevent duplicate initialization (idempotent)
 *   - Run storage migrations
 *   - Validate bootstrap state
 *   - Error boundaries (failures never break CRM)
 *   - Diagnostic logging (dev mode only)
 *
 * Finance is the first Companion module.
 * Additional modules will be registered here in the future.
 */

import { CompanionApp } from "./companion-app";
import { CompanionModule } from "./companion-module";
import { ModuleManager } from "./module-manager";
import { FinanceController } from "./finance-controller";
import { FinanceWidget } from "./finance-widget";
import { FINANCE_WIDGET_CSS } from "./finance-widget.css";
import { diag, diagError, diagWarn } from "./dev";
import { runMigrations } from "./storage-migration";
import { setRegisteredModules, exposeDiagnostics } from "./companion-diagnostics";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let app: CompanionApp | null = null;
let widget: FinanceWidget | null = null;
let controller: FinanceController | null = null;
let stylesInjected = false;
let widgetInitialized = false;

// ---------------------------------------------------------------------------
// Finance module
// ---------------------------------------------------------------------------

function injectFinanceStyles(): void {
    if (stylesInjected) return;
    stylesInjected = true;
    const style = document.createElement("style");
    style.id = "ab-finance-styles";
    style.textContent = FINANCE_WIDGET_CSS;
    document.head.appendChild(style);
}

/**
 * Lazily initialize the Finance widget on first open.
 * Creates controller and widget, then hides the widget.
 * The widget remains hidden until the user opens it via the Companion launcher.
 */
function ensureFinanceWidget(): void {
    if (widgetInitialized) return;
    widgetInitialized = true;

    injectFinanceStyles();
    controller = new FinanceController();
    widget = new FinanceWidget(controller);
    widget.hide();
    diag("Finance created");
}

function createFinanceModule(): CompanionModule {
    return {
        name: "finance",
        label: "Finance",
        open(): void {
            ensureFinanceWidget();
            widget?.show();
            diag("Finance shown");
        },
        close(): void {
            widget?.hide();
            diag("Finance hidden");
        },
        get isOpen(): boolean {
            return widget?.isVisible ?? false;
        },
        destroy(): void {
            widget?.destroy();
            controller?.cancelPending();
            widget = null;
            controller = null;
            widgetInitialized = false;
        },
    };
}

// ---------------------------------------------------------------------------
// App creation
// ---------------------------------------------------------------------------

function createApp(): void {
    diag("Creating ModuleManager");
    const manager = new ModuleManager();

    diag("Registering Finance module");
    manager.register(createFinanceModule());

    // Expose registered modules for diagnostics
    setRegisteredModules(manager.getAll().map((m) => m.name));

    diag("Creating CompanionApp");
    app = new CompanionApp(manager);

    diag("Starting CompanionApp");
    app.start();

    // Expose diagnostics in dev mode
    exposeDiagnostics();
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

export function bootstrap(): void {
    try {
        // Wait for DOM ready
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", bootstrap);
            return;
        }

        // Guard: only run once
        if ((window as any).__AB_COMPANION_APP__) {
            diagWarn("Bootstrap already completed, skipping");
            return;
        }
        (window as any).__AB_COMPANION_APP__ = true;

        // Guard: top frame only
        if (window !== window.top) {
            diag("Skipping iframe context");
            return;
        }

        diag("Bootstrap started");

        // Run storage migrations
        runMigrations();

        // Create and start application
        createApp();

        diag("Bootstrap finished");
    } catch (error) {
        // Error boundary: failures never break CRM
        diagError("Bootstrap failed:", error);

        // Disable Companion to prevent repeated failures
        try {
            (window as any).__AB_COMPANION_APP__ = true;
        } catch {
            // Ignore — we're already in error handling
        }
    }
}

// Auto-bootstrap when loaded as userscript (Tampermonkey)
// Content script imports and calls bootstrap() explicitly
if (typeof chrome === "undefined" || !chrome.runtime?.id) {
    bootstrap();
}
