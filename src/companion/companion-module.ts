/**
 * CompanionModule
 *
 * Lightweight interface for Companion-hosted modules.
 * Each module registers itself with CompanionApp which
 * manages its lifecycle and launcher integration.
 */

export interface CompanionModule {
    /** Unique module identifier. */
    readonly name: string;

    /** Human-readable label shown in the launcher. */
    readonly label: string;

    /** Open/show the module. */
    open(): void;

    /** Close/hide the module. */
    close(): void;

    /** Whether the module is currently open. */
    readonly isOpen: boolean;

    /** Clean up resources. */
    destroy(): void;
}
