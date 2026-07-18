# Roadmap

## M1 — Repository Setup

Establish the project foundation and documentation.

- Initialize repository with directory structure
- Write all project documentation (README, PROJECT, AI_CONTEXT, CODING_RULES, ARCHITECTURE)
- Define module interfaces and lifecycle contracts
- Set up coding standards and commit conventions
- Create roadmap and TODO tracking

## M2 — Current Userscript Migration

Extract and migrate essential functionality from the original AgencyBooster Developer Toolkit.

- Port the core module system (Module Manager, lifecycle management)
- Port the Event Bus with namespaced publish-subscribe
- Port the Config system with defaults and persistence
- Port the Logger with structured output and severity levels
- Port Runtime Spy module for console and error interception
- Port Network Spy module for request monitoring
- Port DOM Inspector module for element analysis
- Port Storage Inspector module for storage viewing and editing
- Port Event Spy module for DOM event listener discovery
- Port Dashboard module for consolidated panel view
- Verify all migrated modules function correctly

## M3 — Diagnostics

Build the diagnostic collection and reporting system.

- Define the DiagnosticCollector interface and base implementation
- Implement runtime environment information gathering
- Build module state snapshot collection
- Create the DiagnosticReport structure and serializer
- Implement on-demand diagnostic capture
- Add diagnostic history storage and retrieval
- Build diagnostic comparison between snapshots

## M4 — Snippet Manager

Build the snippet storage and execution system.

- Define the Snippet interface with metadata fields
- Implement snippet CRUD operations through Storage
- Build the snippet execution sandbox
- Add category and tag management
- Implement search and filtering
- Add snippet import and export
- Track execution history and results

## M5 — Companion

Build the cross-tab coordination system.

- Implement tab detection and presence tracking using browser APIs
- Build inter-tab message passing layer
- Implement configuration synchronization between instances
- Add diagnostic event relay for consolidated viewing
- Build the presence indicator in the UI
- Support command relay between tabs

## M6 — Toolkit Extraction

Refactor the toolkit into a clean, distributable form.

- Separate build configuration from runtime code
- Create a clean entry point for toolkit initialization
- Implement a plugin system for third-party module registration
- Build a distribution package for browser extension and userscript contexts
- Add comprehensive documentation for toolkit integration
- Create example configurations and usage patterns
