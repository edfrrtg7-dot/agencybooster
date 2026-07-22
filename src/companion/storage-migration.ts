/**
 * Storage Migration Framework
 *
 * Manages storage schema migrations.
 * Migrations execute automatically when version mismatch is detected.
 *
 * Migration list is currently empty.
 * Add migrations as new versions are introduced.
 *
 * Example:
 *   Version 1 → Version 2: rename key "ab-old" to "ab-new"
 *   Version 2 → Version 3: transform value format
 */

import { STORAGE_VERSION, getStoredVersion, setStoredVersion } from "./storage-version";
import { diag } from "./dev";

// ---------------------------------------------------------------------------
// Migration type
// ---------------------------------------------------------------------------

/** A single migration step. */
export interface Migration {
    /** Version this migration migrates FROM. */
    readonly from: number;
    /** Version this migration migrates TO. */
    readonly to: number;
    /** Migration function. Synchronous. */
    readonly migrate: () => void;
}

// ---------------------------------------------------------------------------
// Migration registry
// ---------------------------------------------------------------------------

/**
 * Registered migrations.
 * Add new migrations here as new versions are introduced.
 *
 * Example:
 *   export const MIGRATIONS: Migration[] = [
 *       { from: 1, to: 2, migrate: migrateV1toV2 },
 *       { from: 2, to: 3, migrate: migrateV2toV3 },
 *   ];
 */
export const MIGRATIONS: Migration[] = [];

// ---------------------------------------------------------------------------
// Migration runner
// ---------------------------------------------------------------------------

/**
 * Run all pending migrations from stored version to current version.
 * Migrations execute in order (from → to).
 *
 * Safe to call multiple times — no-op if already at current version.
 */
export function runMigrations(): void {
    const storedVersion = getStoredVersion();

    if (storedVersion >= STORAGE_VERSION) {
        return; // Already up to date
    }

    if (storedVersion === 0) {
        // First run — set version, no migrations needed
        setStoredVersion(STORAGE_VERSION);
        diag("Storage initialized at version", STORAGE_VERSION);
        return;
    }

    diag("Storage migration needed:", storedVersion, "→", STORAGE_VERSION);

    // Find and execute applicable migrations
    let currentVersion = storedVersion;

    for (const migration of MIGRATIONS) {
        if (migration.from === currentVersion) {
            try {
                diag("Running migration:", migration.from, "→", migration.to);
                migration.migrate();
                currentVersion = migration.to;
            } catch (error) {
                diag("Migration failed:", migration.from, "→", migration.to, error);
                // Stop migration chain on failure
                return;
            }
        }
    }

    // Update stored version
    setStoredVersion(STORAGE_VERSION);
    diag("Storage migration complete at version", STORAGE_VERSION);
}
