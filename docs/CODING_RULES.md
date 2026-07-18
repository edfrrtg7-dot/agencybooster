# Coding Rules

## Naming Conventions

- **Files:** Use lowercase kebab-case for all file names. Example: `module-manager.ts`, `event-bus.ts`
- **Directories:** Use lowercase kebab-case for all directory names. Example: `src/core/`, `src/diagnostics/`
- **Classes:** Use PascalCase. Example: `ModuleManager`, `EventBus`, `DiagnosticCollector`
- **Interfaces:** Use PascalCase. Prefix with `I` only when the interface represents a dependency injection contract. Otherwise use descriptive names. Example: `ToolkitModule`, `DiagnosticReport`
- **Type aliases:** Use PascalCase. Example: `ModuleStatus`, `LogLevel`
- **Constants:** Use UPPER_SNAKE_CASE for module-level constants. Use camelCase for local constants. Example: `DEFAULT_LOG_LEVEL`, `maxRetries`
- **Functions and methods:** Use camelCase. Start with a verb that describes the action. Example: `createModule`, `getStorageEntry`, `buildDiagnosticReport`
- **Variables:** Use camelCase. Avoid single-letter names except in short loop constructs. Example: `moduleInstance`, `configValue`
- **Boolean variables:** Use prefixes that convey meaning. Example: `isRunning`, `hasListeners`, `shouldRetry`
- **Events:** Use colon-separated namespaced strings. Example: `core:module:started`, `diagnostics:report:generated`

## File Organization

- Each module occupies a single directory under `src/`
- A module directory contains its entry point file named after the directory. Example: `src/core/index.ts`
- Supporting files within a module use descriptive kebab-case names
- Shared interfaces that span multiple modules belong in the module that owns the contract
- Utility functions shared across modules belong in `src/utils/`
- One primary export per file. Re-export from the module index.

## Logging

- Use the Logger instance provided through the module context. Never create standalone loggers.
- Log at appropriate severity levels:
  - `debug` for internal state transitions and development-time information
  - `info` for significant lifecycle events and user-visible operations
  - `warn` for recoverable issues that may require attention
  - `error` for failures that affect functionality
- Include structured context in log messages. Use key-value pairs, not concatenated strings.
- Never log sensitive data such as tokens, passwords, or personal information.

## Error Handling

- Every async operation must have explicit error handling. Use try-catch or .catch() at every call site.
- Wrap module initialization, start, stop, and destroy operations in error boundaries.
- Log all caught errors with sufficient context to understand the failure.
- Recover gracefully where possible. If recovery is not possible, transition the module to an error state.
- Never use empty catch blocks. At minimum, log the error.
- Propagate errors to the caller when the current module cannot resolve them.

## Storage Rules

- All persistent data must go through the Storage abstraction layer in `src/storage/`
- Never access `localStorage`, `sessionStorage`, or cookies directly from modules
- Define a clear schema for every stored data structure
- Version stored data structures and provide migration paths when schemas change
- Treat stored data as untrusted. Validate and sanitize on read.

## DOM Interaction

- All DOM manipulation must go through the UI module boundary in `src/ui/`
- Never query or modify DOM elements directly from core, storage, diagnostics, or other non-UI modules
- Use a consistent element creation pattern. Avoid inline HTML construction where component patterns exist.
- Clean up event listeners and DOM references when modules stop or destroy
- Respect the existing page. Minimize visual and structural footprint.

## Refactoring Policy

- Refactor only when there is a clear, documented reason
- Preserve public interfaces during refactoring. Internal changes should not break module contracts.
- Refactor in small, verifiable steps. Each step should leave the codebase in a working state
- Document the reason for refactoring in the commit message

## Commit Philosophy

- Every commit must be a single, coherent change
- Commit messages use imperative mood and describe what the change does
- Format: short summary (50 chars or less), optional body with details
- Never commit half-working states. Every commit should leave the project in a valid state.
- Never commit generated files, build artifacts, or temporary files
