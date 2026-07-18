# Architecture

## Overview

AgencyBooster uses a modular architecture where each capability is an independent module managed by a central module manager. Modules communicate through an event bus and share configuration through a centralized config system. A logger provides structured output across all modules.

```
┌─────────────────────────────────────────────────────┐
│                      UI Layer                        │
│            Panel rendering, components, themes       │
├─────────────┬─────────────┬────────────┬────────────┤
│ Diagnostics │  Snippets   │ Companion  │   Backup   │
│  collectors │  manager    │  sync      │  restore   │
├─────────────┴─────────────┴────────────┴────────────┤
│                   Core Layer                         │
│        Module Manager · Event Bus · Config           │
├─────────────────────────────────────────────────────┤
│                   Storage Layer                      │
│          Persistence abstraction, schema mgmt        │
├─────────────────────────────────────────────────────┤
│                    Utilities                         │
│             Shared helpers, type definitions         │
└─────────────────────────────────────────────────────┘
```

## Module System

Every module implements the `ToolkitModule` interface and follows a strict lifecycle:

```
created → initialized → started → running → stopped → destroyed
                                    ↓
                                  error
```

The Module Manager is responsible for registering, initializing, starting, stopping, and destroying modules in the correct order. Modules declare their dependencies. The Module Manager resolves dependency order and prevents circular dependencies.

## Core (`src/core/`)

The Core module provides the foundation that all other modules depend on.

### Responsibilities

- **Bootstrap:** Initialize the toolkit, wire together core services, register and start modules
- **Event Bus:** Provide publish-subscribe communication between modules. Decouple modules from each other. Support namespaced events and once-listeners.
- **Config:** Manage toolkit configuration. Provide defaults, merge user overrides, persist changes, emit configuration change events.
- **Logger:** Provide structured logging with severity levels, timestamps, and source module identification.
- **Module Manager:** Register modules, resolve dependency order, manage lifecycle transitions, enforce state constraints.

### Dependencies

Core has no dependencies on other modules. It is the foundation layer.

## Storage (`src/storage/`)

The Storage module provides a unified abstraction for persistent data.

### Responsibilities

- Abstract access to browser storage APIs (localStorage, sessionStorage, cookies)
- Provide a key-value interface with namespacing to prevent collisions
- Validate and sanitize data on read and write
- Support schema versioning and migration for stored data structures
- Emit events when stored data changes

### Dependencies

Storage depends on Core (Event Bus, Logger, Config).

## UI (`src/ui/`)

The UI module handles all user interface rendering and interaction.

### Responsibilities

- Render and manage the main toolkit panel
- Provide a component system for building interface elements
- Handle theme application and visual consistency
- Manage panel open, close, minimize, and positioning state
- Process user input events and route them to appropriate modules
- Provide DOM abstraction so other modules never interact with DOM directly

### Dependencies

UI depends on Core (Event Bus, Logger, Config). UI does not depend on Diagnostics, Snippets, Companion, or Backup.

## Diagnostics (`src/diagnostics/`)

The Diagnostics module collects runtime information and generates structured reports.

### Responsibilities

- Collect diagnostic snapshots from all registered modules
- Gather runtime environment information (browser, page, timing)
- Compile diagnostic data into structured reports
- Support on-demand and scheduled diagnostic collection
- Store diagnostic history for comparison and trend analysis

### Dependencies

Diagnostics depends on Core (Event Bus, Logger). Diagnostics reads state from other modules through their public interfaces.

## Snippets (`src/snippets/`)

The Snippets module manages saved code blocks that can be executed on demand.

### Responsibilities

- Store, retrieve, and organize saved code snippets
- Provide a safe execution context for running saved snippets
- Support snippet categories, tags, and search
- Log snippet execution results and errors
- Import and export snippet collections

### Dependencies

Snippets depends on Core (Event Bus, Logger, Config) and Storage.

## Backup (`src/backup/`)

The Backup module handles configuration and data backup and restore.

### Responsibilities

- Export complete toolkit configuration and user data
- Import previously exported configuration and data
- Validate backup integrity and compatibility
- Support selective restore of individual settings or data sets
- Maintain backup history with timestamps

### Dependencies

Backup depends on Core (Event Bus, Logger, Config) and Storage.

## Companion (`src/companion/`)

The Companion module enables cross-tab and cross-device coordination.

### Responsibilities

- Detect and track other active toolkit instances across browser tabs
- Synchronize configuration between instances
- Relay diagnostic events between tabs for consolidated viewing
- Provide a presence system that shows active toolkit instances
- Support message passing for inter-tab command execution

### Dependencies

Companion depends on Core (Event Bus, Logger, Config) and Storage.

## Utilities (`src/utils/`)

The Utilities module contains shared helper functions and type definitions.

### Responsibilities

- Provide common utility functions (formatting, parsing, comparison, cloning)
- Define shared TypeScript types and interfaces used across modules
- Offer retry, debounce, throttle, and timeout helpers
- Provide safe JSON serialization and deserialization
- Supply type guards and assertion functions

### Dependencies

Utilities has no dependencies on other modules. It is a leaf dependency.

## Data Flow

```
User Action → UI → Event Bus → Target Module → Storage (if persistence needed)
                        ↑
Module State Change → Event Bus → Subscribers (UI, Diagnostics, Companion)
```

Modules never call each other directly. All cross-module communication flows through the Event Bus. Modules expose their state through public methods defined in their interface, which the Module Manager enforces.
