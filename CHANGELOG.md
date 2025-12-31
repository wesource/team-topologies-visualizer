# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-12-31

### Added
- Initial implementation of Team Topologies Visualizer
- Dual-view canvas: Current State (organizational hierarchy) and TT Vision
- HTML5 Canvas-based interactive visualization with drag-and-drop
- FastAPI backend with REST API endpoints
- Markdown file-based storage with YAML frontmatter
- Configurable team types via JSON (current-team-types.json, tt-team-types.json)
- Organization hierarchy visualization with departments, line managers, and regional structure
- Comprehensive test suite (56 tests total):
  - Backend unit tests (pytest, 10 tests)
  - Frontend unit tests (Vitest, 23 tests)
  - End-to-end tests (Playwright, 23 tests)
- ESLint configuration for JavaScript code quality
- Docker/Podman containerization support
- Example data for fictitious company (LogiTech Solutions)
- Documentation (README.md, SETUP.md, CONCEPTS.md)

### Changed
- Refactored frontend from monolithic app.js (694 lines) into 5 modular files
- Anonymized example data (removed potentially identifiable names)

### Technical Details
- Python 3.14.2 with FastAPI 0.115.0
- Vanilla JavaScript (ES6 modules)
- HTML5 Canvas for visualization
- File-based storage (no database)
- Git-friendly markdown format

---

## Release History

_No releases yet. This is the initial development version._
