# Development Notes

Quick reference for development decisions and notable issues encountered during this project.

## Project Context

**Date**: December 31, 2025  
**Approach**: AI-assisted development (GitHub Copilot / Claude Sonnet 4)  
**Purpose**: Learning project - exploring Python, FastAPI, and testing tools while building a practical Team Topologies visualization tool

## Key Technical Decisions

### Frontend Architecture
Modular structure with 5 separate files:
- Separate rendering logic (current vs TT vision)
- Isolated API layer
- Distinct event handling

### Data Structure
Added `organization-hierarchy.json` to support realistic org structure (Company → Departments → Line Managers/Regions → Teams). VP information stored as strings rather than rendered boxes to reduce visual complexity.

## Test Strategy

Three-layer pyramid: Backend unit (pytest, ~0.5s) → Frontend unit (Vitest, ~1.7s) → E2E (Playwright, ~3-5s). Total 56 tests. Run frequently during development for fast feedback.

## Development Tips

- **Browser cache**: Use Ctrl+Shift+R for hard refresh during frontend changes
- **Canvas debugging**: Added console.log statements in rendering functions (can be removed before production)
- **Test before commit**: Run all three test layers

## Git Workflow

After initial commit:
- Use feature branches for new capabilities
- Atomic commits (one logical change)
- Tag releases with semantic versioning
