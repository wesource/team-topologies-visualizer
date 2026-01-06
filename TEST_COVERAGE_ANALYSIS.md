# Test Coverage Analysis - January 6, 2026

## ✅ UPDATE: Phase 1 & 2 COMPLETE (January 6, 2026)

**Final Test Count**: 332 tests (+85 from 247)
- **Backend**: 55 tests (+20 Phase 1)
- **Frontend**: 195 tests (+54 Phase 2)
- **E2E**: 82 tests (+11 Phase 1)

**Phase 1 Complete** (4.5 hours):
- 20 backend tests for Pre-TT API endpoints
- 11 E2E tests for Product Lines + Value Streams perspectives

**Phase 2 Complete** (6 hours):
- 27 frontend unit tests for renderer-product-lines.js
- 24 frontend unit tests for renderer-value-streams.js
- Bug fixes: darkenColor null handling, totalWidth calculation

**Phase 3 Optional** (deferred): API integration tests, additional edge cases (~8 tests)

---

## Current Test Status

### Test Count Summary (Original - Before Phase 1&2)
- **Backend (pytest)**: 35 tests ✅
- **Frontend (vitest)**: 141 tests ✅  
- **E2E (Playwright)**: 71 tests ✅
- **Total**: 247 tests

### Test Count Summary (CURRENT - After Phase 1&2)
- **Backend (pytest)**: 55 tests ✅ (+20)
- **Frontend (vitest)**: 195 tests ✅ (+54)
- **E2E (Playwright)**: 82 tests ✅ (+11)
- **Total**: 332 tests ✅ (+85, +34% increase)

### Recent Features Added (Last 25 commits)

Based on git log and CHANGELOG.md analysis:

1. **Value Streams Grouping for Pre-TT View** (Latest commit)
   - New API endpoint: `/api/pre-tt/value-streams`
   - New renderer: `renderer-value-streams.js`
   - New backend routes: `routes_pre_tt.py`
   - **Test Coverage**: ❌ MISSING

2. **Product Lines View** (Phase 1 Complete)
   - API endpoint: `/api/pre-tt/product-lines`
   - Renderer: `renderer-product-lines.js`
   - Hybrid layout with vertical lanes + shared teams
   - **Test Coverage**: ❌ MISSING

3. **Perspective Selector UI** (Hierarchy/Product Lines/Value Streams)
   - Radio buttons to switch between Pre-TT perspectives
   - State management for perspective switching
   - **Test Coverage**: ⚠️ PARTIAL (E2E has hierarchy, missing product-lines and value-streams)

4. **Toolbar UI Improvements** (Pipes + Frame)
   - Pipe separators between radio options
   - Framed perspective selector
   - **Test Coverage**: ✅ ADEQUATE (visual change, no logic)

5. **Backend API Refactoring** (Pre-TT vs TT-Design split)
   - Split routes: `routes_pre_tt.py` + `routes_tt.py`
   - New `/api/pre-tt/*` and `/api/tt/*` structure
   - **Test Coverage**: ⚠️ PARTIAL (existing tests cover old endpoints)

6. **Pre-TT Template System**
   - New `templates/pre-tt-team-template.md`
   - Support for `product_line`, `line_manager`, `dependencies` fields
   - **Test Coverage**: ✅ ADEQUATE (field parsing tested in test_team_api_fields.py)

7. **Snapshot Comparison View** (Earlier commit)
   - Side-by-side comparison with change badges
   - **Test Coverage**: ✅ EXCELLENT (51 tests: 43 unit + 8 E2E)

## Critical Gaps Identified

### Priority 1: CRITICAL - Missing Unit Tests

#### 1.1 Backend: Pre-TT Routes (`routes_pre_tt.py`)
**Missing Coverage**:
- `/api/pre-tt/value-streams` endpoint
- `/api/pre-tt/product-lines` endpoint  
- Value streams JSON parsing logic
- Product lines JSON parsing logic
- Error handling for missing config files

**Why Critical**: These are new API endpoints with no backend validation. Could fail silently in production.

**Estimated Effort**: 2-3 hours (8-12 tests)

#### 1.2 Frontend: Product Lines Renderer (`renderer-product-lines.js`)
**Missing Coverage**:
- Hybrid layout calculation (vertical lanes + horizontal shared row)
- Team positioning within product lanes
- Shared teams positioning logic
- Product lane header rendering
- Edge cases: empty product, all teams shared, etc.

**Why Critical**: Complex layout logic with no automated testing. Regression risk is high.

**Estimated Effort**: 3-4 hours (15-20 tests)

#### 1.3 Frontend: Value Streams Renderer (`renderer-value-streams.js`)
**Missing Coverage**:
- Value stream swimlane layout
- Team positioning within value streams
- Value stream header rendering
- Edge cases: empty value stream, teams without value stream, etc.

**Why Critical**: Brand new feature with zero test coverage. High risk.

**Estimated Effort**: 3-4 hours (15-20 tests)

### Priority 2: HIGH - Missing E2E Tests

#### 2.1 Pre-TT Perspective Switching
**Missing Coverage**:
- Switch from Hierarchy → Product Lines view
- Switch from Hierarchy → Value Streams view
- Switch from Product Lines → Value Streams view
- Verify correct teams rendered in each perspective
- Verify perspective state persists on refresh

**Why High**: Core user workflow for Pre-TT view navigation.

**Estimated Effort**: 1-2 hours (3-5 tests)

#### 2.2 Product Lines View E2E
**Missing Coverage**:
- Product lanes render with correct teams
- Shared teams render in horizontal row
- Product lane headers display correctly
- Teams positioned correctly within lanes
- Visual regression test (screenshot)

**Why High**: No E2E validation of this entire view.

**Estimated Effort**: 1-2 hours (3-5 tests)

#### 2.3 Value Streams View E2E
**Missing Coverage**:
- Value stream swimlanes render with correct teams
- Value stream headers display correctly
- Teams positioned correctly within streams
- Visual regression test (screenshot)

**Why High**: No E2E validation of this entire view.

**Estimated Effort**: 1-2 hours (3-5 tests)

### Priority 3: MEDIUM - Improved Coverage

#### 3.1 API Route Integration Tests
**Partial Coverage**:
- Existing tests cover old `/api/teams` endpoints
- New split endpoints need dedicated tests
- Test both `/api/pre-tt/*` and `/api/tt/*` prefixes

**Why Medium**: Existing tests provide some coverage, but not comprehensive.

**Estimated Effort**: 1 hour (5-8 tests)

## Recommendations

### Recommendation 1: Focus on Unit Tests First ✅

**Your instinct is correct**: Unit tests should be the priority. They:
- Run faster (seconds vs minutes)
- Provide better error isolation
- Easier to debug
- Cheaper to maintain
- Higher ROI

### Recommendation 2: Add E2E Tests for New Perspectives ✅

**Your idea is also correct**: One E2E test per Pre-TT perspective makes sense:
- Hierarchy view (✅ already exists)
- Product Lines view (❌ missing)
- Value Streams view (❌ missing)

These are critical user workflows and worth the E2E test investment.

### Recommendation 3: Phased Implementation

**Phase 1 (Immediate - 4-6 hours)**:
1. Backend unit tests for Pre-TT routes (2-3 hours)
2. E2E test for Product Lines perspective (1 hour)
3. E2E test for Value Streams perspective (1 hour)

**Phase 2 (Next session - 6-8 hours)**:
1. Frontend unit tests for `renderer-product-lines.js` (3-4 hours)
2. Frontend unit tests for `renderer-value-streams.js` (3-4 hours)

**Phase 3 (Future - 2-3 hours)**:
1. API integration tests for route splitting (1-2 hours)
2. Additional edge case coverage (1 hour)

## Test Files to Create/Modify

### Backend Tests (Create)
- `tests_backend/test_routes_pre_tt.py` - Test Pre-TT API endpoints

### Frontend Tests (Create)
- `frontend/renderer-product-lines.test.js` - Test product lines rendering logic
- `frontend/renderer-value-streams.test.js` - Test value streams rendering logic

### E2E Tests (Create)
- `tests/pre-tt-product-lines.spec.ts` - Test Product Lines perspective E2E
- `tests/pre-tt-value-streams.spec.ts` - Test Value Streams perspective E2E

### E2E Tests (Modify)
- `tests/ui-interactions.spec.ts` - Add perspective switching tests

## Expected Outcomes

### After Phase 1
- **Test Count**: 247 → ~262 tests (+15)
- **Critical Coverage**: New API endpoints validated
- **User Workflows**: Both new perspectives covered by E2E
- **Time Investment**: 4-6 hours
- **Risk Reduction**: HIGH (catches API failures and view switching bugs)

### After Phase 2
- **Test Count**: 262 → ~297 tests (+35)
- **Critical Coverage**: Both new renderers fully tested
- **Regression Prevention**: HIGH (layout logic changes won't break silently)
- **Time Investment**: 6-8 hours
- **Risk Reduction**: VERY HIGH (comprehensive coverage of complex rendering)

### After Phase 3
- **Test Count**: 297 → ~305 tests (+8)
- **Critical Coverage**: API integration validated
- **Edge Cases**: Covered
- **Time Investment**: 2-3 hours
- **Risk Reduction**: MEDIUM (incremental improvement)

## Conclusion

**Is it worth the investment?** ✅ **YES**

You've added significant new functionality without corresponding test coverage. The investment is worthwhile because:

1. **Complexity**: The new renderers have complex layout logic
2. **User-Facing**: These are core user workflows, not edge features
3. **Regression Risk**: Without tests, future changes could break these views
4. **ROI**: 10-15 hours of testing work protects weeks of development effort
5. **Professional Practice**: Good test coverage is table stakes for production code

**Start with Phase 1** (4-6 hours) to get immediate risk reduction, then continue with Phase 2 when time permits.
