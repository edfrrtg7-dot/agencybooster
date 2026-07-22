# AI Rules

## Overview

This document defines mandatory rules for every AI assistant working on the Companion project. Read this document before any implementation task.

## Required Reading Order

Every AI assistant must read these documents in order before beginning any task:

1. [Vision](vision.md) — understand why Companion exists
2. [Architecture](architecture.md) — understand the system design
3. [Coding Standards](coding-standards.md) — understand code conventions
4. [Module API](module-api.md) — understand module lifecycle
5. Current task — understand what is being requested

Skipping any document leads to incorrect implementations.

## AI Responsibilities

AI implements what is requested. AI does not:

- Redesign architecture
- Rename public APIs
- Refactor unrelated code
- Replace existing design patterns
- Introduce new dependencies
- Add features not requested
- "Improve" code without approval

### When Uncertain

If you are uncertain about any aspect of the implementation:

1. **Stop.** Do not guess.
2. **Explain the uncertainty.** Describe what is unclear.
3. **Wait for clarification.** Do not proceed until resolved.

## Implementation Rules

### Scope

- Implement only the requested scope
- Do not expand scope beyond what is asked
- Do not add "while we're at it" changes
- Every change must be traceable to a specific request

### Stability

- Keep public APIs stable
- Preserve backward compatibility
- Never change architecture without explicit approval
- Document any deviation from existing patterns

### Documentation

- Separate Suggestions from Implementation
- Suggestions go in the report, not in code
- Documentation changes require the same rigor as code changes

## Forbidden Actions

| Action | Reason |
|--------|--------|
| Architecture redesign | Violates architectural stability |
| Hidden refactoring | Changes behavior without approval |
| File renaming | Breaks references and git history |
| Dependency changes | Introduces unvetted risk |
| Framework changes | Violates technology constraints |
| Automatic optimization | May introduce subtle bugs |
| Speculative improvements | Solves problems that do not exist |

## Code Quality Rules

### TypeScript

- Strict TypeScript at all times
- Never use `any` type
- Prefer `unknown` over `any`
- Use explicit return types for public methods

### Code Structure

- No duplicated logic — extract to shared utilities
- No magic values — use named constants
- Single responsibility — each class does one thing
- Deterministic implementations — same input, same output

### Architecture

- CompanionApp never imports specific modules
- Modules never import other modules
- Business logic never exists inside UI classes
- Controllers never manipulate DOM
- CompanionWindow owns all window behavior
- ModuleManager owns module lifecycle

## Review Checklist

Before completing any implementation task, verify:

- [ ] Only requested changes were made
- [ ] No unrelated code was modified
- [ ] Public APIs remain stable
- [ ] Documentation is updated if needed
- [ ] No new dependencies introduced
- [ ] Code follows naming conventions
- [ ] No `any` types used
- [ ] No magic values present
