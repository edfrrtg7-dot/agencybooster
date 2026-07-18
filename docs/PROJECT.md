# Project Description

## What AgencyBooster Is

AgencyBooster is a modular developer toolkit designed to assist frontend developers with runtime inspection, debugging, and automation within browser environments. It provides a structured alternative to scattered browser DevTools workflows by consolidating diagnostic, inspection, and automation capabilities into a single, extensible platform.

## Purpose

The toolkit exists to reduce the friction of day-to-day frontend development. Developers frequently switch between console, network tab, storage viewers, and DOM inspectors. AgencyBooster brings these capabilities together into a cohesive interface with persistent state, custom configuration, and reusable automation through snippets.

## Main Objectives

- Deliver a modular runtime toolkit where each capability is an independent, lifecycle-managed module
- Provide persistent configuration and state that survives browser sessions
- Enable diagnostic collection and structured reporting for debugging complex applications
- Support snippet-based automation for repetitive inspection and testing tasks
- Maintain a lightweight footprint with zero external runtime dependencies

## Non-Goals

- AgencyBooster is not a replacement for browser DevTools. It complements existing tooling.
- It is not a general-purpose browser extension framework. It is a focused developer tool.
- It does not aim to provide production monitoring or analytics capabilities.
- It is not designed for end-user facing functionality. Its audience is developers.

## Target Users

- Frontend developers working on complex single-page applications
- Debuggers investigating runtime behavior, network issues, or storage state
- Teams needing shared diagnostic workflows and reproducible inspection steps
- Developers who want to automate repetitive browser-based tasks through saved snippets

## Relationship with the Original Company Extension

AgencyBooster originated from the AgencyBooster Developer Toolkit, a Chrome extension built with Manifest V3, TypeScript, and Vite. The original extension provided modules for runtime spying, network monitoring, DOM inspection, storage inspection, event logging, and a dashboard panel.

The new AgencyBooster project restructures this concept into a more modular, framework-agnostic architecture. The core module system, event bus, configuration layer, and module interfaces carry forward from the original. The new structure separates concerns more clearly and prepares the toolkit for expansion into diagnostics, snippets, companion services, and backup capabilities that were not present in the original extension.
