# AI Context

This document provides context for AI assistants working on the AgencyBooster project.

## Project Overview

AgencyBooster is a modular developer toolkit for browser-based frontend debugging and automation. It provides runtime inspection, network monitoring, DOM analysis, storage debugging, event tracking, diagnostic reporting, snippet management, and companion services.

The project is currently in its initial documentation and architecture phase. No implementation code exists yet in the main repository. An earlier prototype exists in the `agencybooster-devtoolkit` directory as a Chrome extension with TypeScript and Vite.

## Development Philosophy

- **Documentation first.** Every module is described in architecture documents before code is written.
- **Modularity over monolith.** Each capability is an independent module with a defined lifecycle.
- **Zero external runtime dependencies.** The toolkit operates without requiring third-party packages at runtime.
- **Minimal footprint.** Every addition must justify its presence in terms of value versus size.
- **Incremental delivery.** Work proceeds in milestones. Each milestone produces a working, testable increment.
- **Structural clarity.** File names, module names, and directory names communicate purpose without ambiguity.

## Current Priorities

1. Complete project documentation and architecture definition
2. Establish the core module system, event bus, configuration, and logger
3. Migrate essential functionality from the original Chrome extension prototype
4. Build out the diagnostic collector and report generation system
5. Implement the snippet manager for saved code execution
6. Develop the companion service for cross-tab coordination

## Coding Expectations

- Use TypeScript with strict type checking
- Follow the naming conventions defined in CODING_RULES.md
- Organize code according to the module boundaries defined in ARCHITECTURE.md
- Handle all errors explicitly. Never let errors propagate silently.
- Log significant operations and state changes through the logger module
- Store persistent data through the storage abstraction layer, never directly
- Interact with the DOM through the UI module boundary, never ad-hoc
- Write code that is self-documenting through clear naming and structure

## Things AI Should Never Do

- Never introduce external runtime dependencies without explicit approval
- Never generate placeholder or stub implementations that pretend to work
- Never bypass the module lifecycle system to access internal state directly
- never hardcode configuration values that belong in the config system
- Never write code that relies on global variables or implicit shared state
- Never skip error handling or swallow exceptions without logging
- Never create files outside the defined directory structure
- Never commit secrets, API keys, or credentials
- Never make architectural decisions without documenting them first
