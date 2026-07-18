# AgencyBooster

A modular developer toolkit for runtime inspection, network monitoring, DOM analysis, storage debugging, and event tracking in browser environments.

## Goals

- Provide a unified, extensible platform for frontend development and debugging
- Replace ad-hoc console-based workflows with structured, persistent tooling
- Deliver diagnostic capabilities that survive page reloads and navigation
- Enable snippet-based automation for repetitive development tasks
- Operate as a lightweight, dependency-free runtime toolkit

## Features

### Current

- Modular architecture with lifecycle-managed modules
- Event bus for inter-module communication
- Configuration system with persistent settings
- Structured logging with severity levels

### Planned

- Runtime inspection and monitoring
- Network request interception and analysis
- DOM structure inspection and highlighting
- Storage (localStorage, sessionStorage, cookies) viewer and editor
- Event listener discovery and logging
- Diagnostic report generation
- Snippet manager for saved and reusable code blocks
- Companion service for cross-tab and cross-device coordination
- Backup and restore of toolkit configuration

## Repository Structure

```
AgencyBooster/
├── src/
│   ├── core/            Bootstrap, event bus, config, module manager, logger
│   ├── storage/         Storage abstraction and persistence layer
│   ├── ui/              Panel rendering, theme system, component library
│   ├── diagnostics/     Diagnostic collectors and report generation
│   ├── snippets/        Snippet storage, execution, and management
│   ├── backup/          Configuration backup and restore
│   ├── companion/       Cross-tab and cross-device synchronization
│   └── utils/           Shared helpers and utility functions
├── scripts/             Build and automation scripts
├── assets/              Icons, images, and static resources
└── docs/                Project documentation
```

## Development Workflow

All development follows a documentation-first approach. Every module is described in architecture documents before implementation begins. Code changes are tracked through structured commits with clear, descriptive messages. The project uses a milestone-driven roadmap where each milestone delivers a self-contained, testable increment.

## License

This project is licensed under the terms found in the [LICENSE](LICENSE) file.
