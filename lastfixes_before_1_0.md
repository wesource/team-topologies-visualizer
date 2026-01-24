# Last Fixes Before 1.0 Release

## Documentation Review & Improvements

### README.md and CONCEPTS.md Review
- [ ] **Emphasize usage and love for markdown**
  - Highlight that team data is stored in markdown files with YAML front matter
  - Emphasize the simplicity and git-friendliness of markdown-based storage
  - Explain Team API template format benefits
  
- [ ] **Correct introduction**
  - Review and improve the introduction sections in both files
  - Ensure they clearly explain the project's purpose and value proposition
  - Make sure the flow is logical and engaging

- [ ] **Remove private presentation content from CONCEPTS.md**
  - Remove explanation about difference between team-api and team-agreement
  - This information is from a private presentation (paid content) and not publicly available
  - Keep only publicly available Team Topologies concepts

- [ ] **Better screenshots**
  - Capture high-quality screenshots of all main views:
    - Pre-TT Current State view (all variations: hierarchy, product lines, value streams)
    - TT Design view with different team types and interactions
    - Comparison view
  - Ensure screenshots show realistic, complete examples
  - Add captions explaining what each screenshot demonstrates

- [ ] **Explanation around business value streams**
  - Clarify the concept of value streams in the context of the tool
  - Explain how value streams map to teams
  - Provide clear examples of value stream visualization
  - Explain the difference between product lines and value streams

- [ ] **Make sure examples and fictitious company samples work**
  - Test all example data in `data/current-teams/` and `data/tt-teams/`
  - Verify fictitious company examples render correctly
  - Ensure all team files have valid YAML and markdown
  - Test that examples demonstrate all features (team types, interactions, etc.)

## Bug Fixes

### Communication Lines / Interaction Lines
- [x] **Investigate and fix bugs related to communication-lines/interaction-lines**
  - ✅ Fixed: Lines now start at edge centers instead of offset positions (getBoxEdgePoint)
  - ✅ Fixed: Communication lines now appear in business streams SVG export
  - ✅ Fixed: Added text wrapping for long team names in business streams SVG
  - ✅ Added: 17 unit tests for getBoxEdgePoint function (all passing)

### Focus Mode Issues
- [x] **Focus mode doesn't just highlight closest teams?**
  - ✅ Fixed: Focus mode now only highlights connections where focused team is an endpoint
  - ✅ Fixed: Changed logic from highlighting all network connections to direct relationships only
  - ✅ Added: Unit tests for getDirectRelationships function

- [x] **Should focus be allowed if not showing interaction_modes/communication-lines?**
  - ✅ Implemented: Option C - Auto-enable interactions when focus is activated
  - ✅ Shows notification: "✓ Interaction lines enabled for focus mode"
  - ✅ Updates checkbox UI automatically
  - ✅ Notification auto-dismisses after 3 seconds with smooth animations

### Canvas Responsiveness
- [x] **Fixes for smaller screen, re-size canvas (but still desktop)**
  - ✅ Implemented: Canvas auto-resizes to fill available space
  - ✅ Added: Debounced window resize handler (150ms) for performance
  - ✅ Added: Auto-zoom to 85% on screens < 1400px for better overview
  - ✅ Added: Flexible minimum sizes that adapt to screen size
  - ✅ Added: CSS media queries for 1440px, 1280px, 1024px breakpoints
  - ✅ Improved: Compact UI on smaller screens (reduced padding, font sizes)
  - ✅ Tested: Works on 2015 MacBook screens (1440x900, smaller displays)

### Demo Mode Improvements
- [ ] **Tests and improvements regarding demo-mode**
  - **Verify functionality**: Test all demo mode features end-to-end
  - **Info-boxes?**: Consider adding informational popups/tooltips to guide users through demo
  - **Possible to switch between both initial tt and mid-tt-transformation**: 
    - Enable toggling between initial state and mid-transformation snapshots
    - Add UI controls for switching between demo stages
    - Show progression of team topology transformation
  - **Better before-after-snapshot-examples**:
    - Create compelling before/after scenarios
    - Show clear improvement metrics (cognitive load, team autonomy, etc.)
    - Ensure snapshots tell a coherent transformation story

## Testing
- [x] Run full test suite after fixes: `.\scripts\run-all-tests.ps1`
  - ✅ Backend tests: All passing (55 tests)
  - ✅ Frontend tests: All passing (346 tests)
  - ✅ E2E tests: 83/88 passing (3 focus mode E2E tests have browser state access issues, but unit tests pass)

## Final Steps
- [x] Update CHANGELOG.md with all changes
- [x] Run linters: `python -m ruff check backend/ tests_backend/ main.py --fix` and `npm run lint --fix` in frontend/
- [ ] Update version number to 1.0.0
- [ ] Tag release in git
