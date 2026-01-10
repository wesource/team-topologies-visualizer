# Test Coverage Gaps Analysis

**Date:** 2026-01-10
**Overall Backend Coverage:** 88%
**Overall Frontend Coverage:** 33.17%

## Backend Coverage Gaps (31% → 95%+ Target)

### 1. routes_pre_tt.py (69% → 90%+ target)
**Missing Coverage (42 lines):**
- Lines 31-39: Error handling when team-types.json is missing
- Line 48: Error handling when hierarchy.json is missing  
- Line 62: Error handling in organization hierarchy
- Line 110: Edge cases in product-lines endpoint
- Lines 140-142: Error handling in business-streams
- Lines 184-190: DELETE team endpoint
- Lines 199-212: PUT (update) team endpoint  
- Lines 218-219: Error cases in update team
- Lines 233-242: Create snapshot endpoint error handling
- Lines 254-259: Snapshot comparison endpoint
- Lines 274-282: Load snapshot endpoint

**Tests to Add:**
```python
# tests_backend/test_routes_pre_tt.py (add these)
def test_get_team_types_missing_file()  # 404 when file missing
def test_get_hierarchy_missing_file()  # 404 when file missing
def test_delete_team_success()  # Happy path
def test_delete_team_not_found()  # 404
def test_update_team_success()  # PUT with all fields
def test_update_team_partial()  # PUT with some fields
def test_update_team_not_found()  # 404
def test_create_snapshot_duplicate()  # Name conflict
def test_create_snapshot_invalid_name()  # Bad characters
def test_compare_snapshots_one_missing()  # 404
def test_load_snapshot_not_found()  # 404
```

### 2. services.py (88% → 95%+ target)
**Missing Coverage (26 lines):**
- Lines 97, 101, 103, 105: Edge cases in dependency parsing
- Line 194: Markdown dependency parsing fallback
- Lines 258-259, 273, 275, 277, 279, 281: Error handling in write_team_file_to_path
- Lines 286, 290, 293-295: File I/O error conditions
- Lines 313, 340-341: Edge cases in team finding
- Lines 371, 377-378: Business stream grouping edge cases
- Lines 420, 427-428: Product lines grouping edge cases

**Tests to Add:**
```python
# tests_backend/test_services.py (add these)
def test_parse_dependencies_with_malformed_yaml()
def test_parse_dependencies_markdown_fallback()
def test_write_team_file_readonly_error()
def test_write_team_file_disk_full()
def test_find_team_with_special_characters()
def test_business_streams_with_orphaned_teams()
def test_product_lines_with_missing_metadata()
```

### 3. snapshot_services.py (91% → 98%+ target)
**Missing Coverage (7 lines):**
- Line 25: Snapshot directory creation error
- Lines 170-172: Snapshot file write errors
- Lines 195-197: Snapshot file read errors

**Tests to Add:**
```python
# tests_backend/test_snapshots.py (add these)
def test_create_snapshot_directory_permission_error()
def test_create_snapshot_write_error()
def test_load_snapshot_corrupted_json()
def test_load_snapshot_invalid_encoding()
```

### 4. main.py (85% → 100% target)
**Missing Coverage (3 lines):**
- Line 37: Mount static files (tested manually)
- Lines 53-54: Startup event (tested manually)

**Tests to Add:**
```python
# tests_backend/test_main.py (add these)
def test_static_files_mounted()
def test_startup_event_creates_directories()
def test_root_redirects_to_static()
```

---

## Frontend Coverage Gaps (33% → 70%+ Target)

### Priority 1: Core Application Files (0% → 80%+)

#### app.js (0% coverage - 116 lines)
**Needs Full Test Suite:**
- Application initialization
- Canvas setup
- Event listener setup
- Initial data loading
- Error handling

**Tests to Create:**
```javascript
// app.test.js (NEW FILE)
describe('Application Initialization', () => {
  test('initializes canvas with correct dimensions')
  test('loads config from API')
  test('sets up all event listeners')
  test('loads initial team data')
  test('handles initialization errors gracefully')
  test('switches between views correctly')
  test('handles keyboard shortcuts')
})
```

#### canvas-interactions.js (10% coverage - 291 lines, only 30 covered)
**Missing:**
- Mouse event handlers (mousedown, mousemove, mouseup)
- Panning logic
- Zoom handling
- Drag and drop
- Focus mode toggle
- Context menu prevention

**Tests to Add:**
```javascript
// canvas-interactions.test.js (NEW FILE)
describe('CanvasInteractionHandler', () => {
  describe('Mouse Events', () => {
    test('handles mousedown on team')
    test('handles mousedown on empty canvas')
    test('handles right-click panning')
    test('handles middle-button panning')
  })
  describe('Dragging', () => {
    test('drags team in hierarchy view')
    test('prevents dragging in product-lines view')
    test('prevents dragging in business-streams view')
    test('updates team position on drag end')
  })
  describe('Focus Mode', () => {
    test('activates focus on single click')
    test('deactivates focus on second click')
    test('shows focus indicator')
    test('exits focus on empty canvas click')
  })
  describe('Panning', () => {
    test('pans view on right-click drag')
    test('updates cursor during panning')
  })
  describe('Zooming', () => {
    test('zooms in on wheel up')
    test('zooms out on wheel down')
    test('limits zoom range')
  })
})
```

### Priority 2: UI Components (0% coverage)

#### ui-handlers.js (0% coverage - 574 lines)
**Critical Missing Coverage:**
- Button click handlers
- View switching
- Filter management
- Export functionality
- Validation
- Undo/redo

**Tests to Create:**
```javascript
// ui-handlers.test.js (NEW FILE - HIGH PRIORITY)
describe('UI Handlers', () => {
  test('setupUIHandlers attaches all event listeners')
  test('handleExportSVG exports canvas to SVG')
  test('handleAutoAlign aligns teams by manager')
  test('handleAutoAlignTT aligns teams by value stream')
  test('handleUndo reverts last position change')
  test('handleRefresh reloads all data')
  test('closeModal hides modal dialog')
  test('filter toggle shows/hides filter dropdown')
  test('apply filters updates view')
  test('clear filters resets all filters')
  test('zoom in/out buttons work')
  test('fit view centers content')
  test('validation shows errors')
})
```

#### modals.js (0% coverage - 67 lines)
```javascript
// modals.test.js already exists with 8 tests
// Add more tests for edge cases:
test('modal closes on overlay click')
test('modal prevents body scroll when open')
test('showTeamDetailModal displays all team fields')
test('showInteractionModeModal handles missing data')
```

#### notifications.js (0% coverage - 54 lines)
```javascript
// notifications.test.js (NEW FILE)
describe('Notifications', () => {
  test('showSuccess displays success message')
  test('showError displays error message')
  test('showInfo displays info message')
  test('notifications auto-dismiss after timeout')
  test('multiple notifications stack correctly')
  test('notifications can be manually dismissed')
})
```

### Priority 3: Rendering Components

#### renderer.js (25% coverage - 147 lines, only 37 covered)
**Missing:**
- View-specific rendering logic
- Error handling
- Edge cases

**Tests to Add:**
```javascript
// renderer.test.js (NEW FILE)
describe('Main Renderer', () => {
  test('renders current view correctly')
  test('renders TT design view correctly')
  test('renders product-lines view')
  test('renders business-streams view')
  test('handles empty team data')
  test('applies filters before rendering')
  test('draws connections when enabled')
  test('skips connections when disabled')
  test('applies focus mode opacity')
})
```

#### renderer-current.js (0% coverage - 282 lines)
```javascript
// renderer-current.test.js (NEW FILE)
describe('Current State Renderer', () => {
  test('drawCurrentStateView renders org hierarchy')
  test('draws manager boxes')
  test('draws department groupings')
  test('positions teams under managers')
  test('handles teams without managers')
  test('handles managers without teams')
})
```

### Priority 4: Feature Modules (0% coverage)

#### legend.js (0% coverage - 73 lines)
```javascript
// legend.test.js (NEW FILE)
describe('Legend', () => {
  test('draws legend for current view')
  test('draws legend for TT design view')
  test('shows team type colors')
  test('shows interaction mode styles')
  test('legend updates on view change')
})
```

#### snapshot-handlers.js (0% coverage - 142 lines)
```javascript
// snapshot-handlers.test.js (NEW FILE)
describe('Snapshot Handlers', () => {
  test('create snapshot button creates snapshot')
  test('timeline button opens snapshot list')
  test('clicking snapshot loads it')
  test('exit snapshot returns to live data')
  test('snapshot indicator shows in read-only mode')
})
```

---

## Implementation Priority

### Phase 1: Backend Critical Paths (Week 1)
1. ✅ routes_pre_tt.py - DELETE, PUT, snapshot routes
2. ✅ services.py - Error handling and edge cases
3. ✅ snapshot_services.py - File I/O errors
4. ✅ main.py - Startup and static files

**Target:** Backend coverage 88% → 95%+

### Phase 2: Frontend Core (Week 2)
1. ✅ app.js - Application initialization
2. ✅ canvas-interactions.js - Mouse/keyboard handlers
3. ✅ ui-handlers.js - Button handlers and UI logic
4. ✅ renderer.js - Main rendering loop

**Target:** Frontend coverage 33% → 60%+

### Phase 3: Frontend Components (Week 3)
1. ✅ notifications.js - Notification system
2. ✅ legend.js - Legend drawing
3. ✅ snapshot-handlers.js - Snapshot UI
4. ✅ renderer-current.js - Hierarchy rendering

**Target:** Frontend coverage 60% → 70%+

### Phase 4: Polish & Edge Cases (Week 4)
1. ✅ Add edge case tests to all existing test files
2. ✅ Test error conditions thoroughly
3. ✅ Test browser compatibility edge cases
4. ✅ Integration tests for critical workflows

**Target:** Overall coverage 70% → 80%+

---

## Quick Wins (Can be done today)

### Backend (2-3 hours):
1. Add DELETE team tests (30 min)
2. Add PUT team tests (30 min)
3. Add snapshot error handling tests (30 min)
4. Add services.py error cases (1 hour)

### Frontend (3-4 hours):
1. Create notifications.test.js (30 min)
2. Create legend.test.js (30 min)
3. Add canvas-interactions.test.js basics (1 hour)
4. Add ui-handlers.test.js basics (1.5 hours)

**Impact:** Backend 88% → 93%, Frontend 33% → 45%

---

## Notes

- E2E tests (Playwright) already cover happy paths (82 tests)
- Focus new unit tests on error conditions and edge cases
- Mock external dependencies (file I/O, API calls) for unit tests
- Use existing test patterns from current test files
