# Pre-TT View Improvements - Implementation Solution

## Executive Summary

Enhance Pre-TT views with **multiple organizational perspectives** to address the reality that organizations operate in overlapping structures simultaneously. Start with high-value, low-complexity **Product Lines view**, validate the approach, then expand.

**Key Principle**: Organizations are multi-dimensional. The same teams participate in different organizational patterns (reporting hierarchy, product delivery, value streams) at the same time. Understanding these multiple dimensions is essential for effective Team Topologies transformation planning.

## Strategic Goals

1. **Enable "Sensing Organization"**: Help stakeholders see current state from multiple angles
2. **Support Transformation Planning**: Identify which organizational dimensions need to change vs. preserve
3. **Serve Different Stakeholders**: Executives need value stream view, PMs need product view, managers need hierarchy view
4. **Reveal Conway's Law Issues**: Make visible how current structures might conflict with desired system architecture

## The Three Organizational Perspectives (Refined)

### 1. Reporting Hierarchy (Current - Enhanced)
**"How We Organize People"**

- **Purpose**: Performance management, career development, budget responsibility
- **Structure**: Company → Department → Line Manager → Teams
- **Layout**: Traditional tree/org-chart with clear hierarchical levels
- **Use Cases**: 1:1s, performance reviews, hiring, organizational announcements
- **Status**: Already implemented - will enhance with better visual grouping

### 2. Product/Value Stream View (New)
**"How We Deliver Value"**

- **Purpose**: Product delivery, value flow, customer outcome focus
- **Structure**: Product → Teams OR Value Stream → Product → Teams (user toggleable)
- **Layout**: Vertical product/value-stream lanes with teams as cards
- **Use Cases**: Product roadmaps, portfolio planning, value stream mapping, TT transformation planning
- **Conway's Law Insight**: Shows alignment (or misalignment) between team boundaries and product/value boundaries

### 3. Team Coordination View (Future)
**"How We Coordinate Delivery"**

- **Purpose**: Understand current coordination mechanisms and dependencies
- **Structure**: Teams with collaboration patterns, sync points, dependencies
- **Layout**: Network view with teams and connection lines showing coordination overhead
- **Use Cases**: Identifying cognitive load, planning interaction modes, understanding delivery friction
- **Conway's Law Insight**: Shows current coordination complexity that TT interaction modes should simplify

## Implementation Strategy: 3 Phases

### Phase 1: MVP - Product Lines View (Start Here)
**Goal**: Deliver immediate value with minimal complexity, validate approach

**What to Build**:
1. ✅ Minimal data model extension (just `product_line` field)
2. ✅ Perspective selector UI component
3. ✅ Product Lines renderer (vertical lanes layout)
4. ✅ Backend API for product-grouped structure
5. ✅ Tests (unit + E2E) for new view

**Why Start Here**:
- **Universal applicability**: Every org has products/services
- **Simplest to understand**: Flat grouping, no complex nesting
- **Immediate stakeholder value**: Product managers can see their team allocations
- **Low data overhead**: Just one new field per team
- **UI pattern validation**: Test perspective switching before complex visualizations

**Success Criteria**:
- User can switch between Hierarchy and Product Lines views
- Product Lines view clearly shows which teams work on which products
- Perspective switch takes <2 seconds
- All existing functionality (filters, interactions) work in new view

**Timeline Estimate**: 3-5 days

---

### Phase 2: Value Stream Enhancement
**Goal**: Add value stream grouping for transformation planning

**What to Build**:
1. ✅ Add optional `value_stream` field to teams
2. ✅ Value Stream toggle within Product/Value Stream view
3. ✅ Nested grouping: Value Stream → Products → Teams
4. ✅ Visual hierarchy with nested containers
5. ✅ Configuration file: `value-streams.json`

**Why Second**:
- Builds on Product Lines learnings
- Addresses transformation planning use case
- Optional - orgs without value streams can skip

**Success Criteria**:
- User can toggle between "Product" and "Value Stream" grouping
- Value streams shown as large containers with products nested inside
- Teams without value_stream assignment still visible

**Timeline Estimate**: 4-6 days

---

### Phase 3: Team Coordination View (Future)
**Goal**: Visualize current coordination patterns

**What to Build**:
1. ✅ Network-style renderer showing team connections
2. ✅ Show coordination mechanisms (standups, dependencies, syncs)
3. ✅ Visual indicators of coordination overhead
4. ✅ Bridge to TT interaction modes design

**Why Last**:
- Most complex visualization
- Requires additional data modeling (coordination patterns)
- Highest value comes after understanding static groupings

**Timeline Estimate**: 6-8 days (deferred to future iteration)

---

## Data Model Design

### Minimal Required Changes (Phase 1)

**Team YAML Front Matter Addition**:
```yaml
---
name: "iOS Team"
type: "stream-aligned"  # existing
# ... other existing fields ...

# NEW SECTION (all optional)
organizational_context:
  product_line: "iOS Product"  # Phase 1 - REQUIRED for Product Lines view
  value_stream: "E-commerce"   # Phase 2 - Optional, for Value Stream view
  current_team_type: "feature-team"  # NEW - see "Current Team Type" below
---
```

**Why Minimal**:
- Keeps adoption friction low
- No budget centers, cost centers, release trains yet
- Add complexity only when real usage demands it
- Backward compatible - all fields optional

### Current Team Type (New Concept)

**Purpose**: Show what teams are *today* before TT transformation

**Values** (pre-TT descriptive types):
- `feature-team`: Cross-functional team building features
- `component-team`: Team owning specific technical component
- `platform-team`: Team providing internal platform/tools
- `infrastructure-team`: Team managing infrastructure
- `support-team`: Team providing support/operations
- `architecture-team`: Team providing technical guidance
- `qa-team`: Dedicated testing team
- `other`: Uncategorized

**Why Important**:
- Shows "as-is" state before TT transformation
- Helps identify proto-Platform teams, proto-Stream-aligned teams, etc.
- Enables before/after comparison with TT-Design view
- Different from TT team types (stream-aligned, platform, enabling, complicated-subsystem)

**Visualization**:
- Show as subtle badge/icon in all Pre-TT views
- Use different visual style than TT team types to avoid confusion
- Color/shape indicates current team type

---

### Configuration Files (Phase 2)

**`data/current-teams/products.json`** (Phase 1):
```json
{
  "products": [
    {
      "id": "ios-product",
      "name": "iOS Product",
      "description": "iOS mobile application",
      "product_manager": "Jane Smith",
      "color": "#e74c3c"
    }
  ]
}
```

**`data/current-teams/value-streams.json`** (Phase 2):
```json
{
  "value_streams": [
    {
      "id": "e-commerce",
      "name": "E-commerce Value Stream",
      "description": "Customer-facing digital commerce capabilities",
      "products": ["ios-product", "android-product", "web-product"],
      "color": "#3498db"
    }
  ]
}
```

---

## Backend Implementation

### New API Endpoints

**Phase 1: Product Lines**
```
GET /api/organizational-structure?perspective=product-lines
```

**Response**:
```json
{
  "perspective": "product-lines",
  "products": {
    "iOS Product": {
      "teams": ["iOS Team", "Mobile QA Team"],
      "metadata": {
        "product_manager": "Jane Smith",
        "color": "#e74c3c"
      }
    },
    "Android Product": {
      "teams": ["Android Team"],
      "metadata": {...}
    }
  },
  "teams": [...],  // Full team data
  "teams_without_product": ["Legacy Team"]  // Teams with no product_line set
}
```

**Phase 2: Value Streams**
```
GET /api/organizational-structure?perspective=value-streams
```

**Response** (nested structure):
```json
{
  "perspective": "value-streams",
  "value_streams": {
    "E-commerce": {
      "products": {
        "iOS Product": ["iOS Team", "Mobile QA Team"],
        "Android Product": ["Android Team"]
      },
      "metadata": {...}
    }
  },
  "products_without_value_stream": {...},  // Products not in any value stream
  "teams": [...]
}
```

### Backend Code Structure

**New file**: `backend/perspective_services.py`
```python
"""
Services for organizational perspective data preparation.
Separates perspective logic from team CRUD operations.
"""

def get_product_lines_structure(teams: List[Team]) -> Dict:
    """Group teams by product_line, handle teams without products."""
    pass

def get_value_stream_structure(teams: List[Team]) -> Dict:
    """Group teams by value_stream → product_line, nested structure."""
    pass

def load_product_configuration() -> List[Dict]:
    """Load products.json configuration."""
    pass

def load_value_stream_configuration() -> List[Dict]:
    """Load value-streams.json configuration."""
    pass
```

**Update**: `backend/routes.py` - add new endpoint
```python
@router.get("/api/organizational-structure")
async def get_organizational_structure(perspective: str = "hierarchy"):
    """
    Get organizational structure from different perspectives.
    
    Args:
        perspective: 'hierarchy' | 'product-lines' | 'value-streams'
    """
    teams = team_service.get_all_current_teams()
    
    if perspective == "product-lines":
        return perspective_services.get_product_lines_structure(teams)
    elif perspective == "value-streams":
        return perspective_services.get_value_stream_structure(teams)
    else:  # hierarchy (existing)
        return services.get_org_hierarchy(teams)
```

---

## Frontend Implementation

### UI Component: Perspective Selector

**Location**: Insert in `frontend/index.html` near view mode selector

```html
<div class="view-controls">
  <!-- Existing view mode selector -->
  <div class="control-group">
    <label for="viewMode">View Mode:</label>
    <select id="viewMode">...</select>
  </div>
  
  <!-- NEW: Perspective selector (only visible in current-state view) -->
  <div class="control-group" id="perspectiveControl" style="display: none;">
    <label for="orgPerspective">Organization View:</label>
    <select id="orgPerspective">
      <option value="hierarchy">Reporting Hierarchy</option>
      <option value="product-lines">Product Lines</option>
      <option value="value-streams">Value Streams</option>
    </select>
    <span class="info-icon" title="Different ways to visualize your current organization">ℹ️</span>
  </div>
</div>
```

**Behavior**:
- Only show perspective selector when view mode is "current-state"
- Hide when viewing TT-Design or snapshots
- Persist selected perspective in localStorage
- Show loading indicator during perspective switch

### Renderer Architecture: Factory Pattern

**New file**: `frontend/renderer-factory.js`
```javascript
/**
 * Factory for creating perspective-specific renderers.
 * Each renderer handles layout calculation and drawing for one organizational perspective.
 */

import { HierarchyRenderer } from './renderer-current.js';  // Existing
import { ProductLinesRenderer } from './renderer-product-lines.js';  // New
import { ValueStreamRenderer } from './renderer-value-streams.js';  // Phase 2

class RendererFactory {
  static create(perspective, canvas, teams, structure) {
    switch(perspective) {
      case 'hierarchy':
        return new HierarchyRenderer(canvas, teams, structure);
      case 'product-lines':
        return new ProductLinesRenderer(canvas, teams, structure);
      case 'value-streams':
        return new ValueStreamRenderer(canvas, teams, structure);
      default:
        throw new Error(`Unknown perspective: ${perspective}`);
    }
  }
}

export { RendererFactory };
```

**Renderer Interface** (all renderers implement):
```javascript
class BaseRenderer {
  constructor(canvas, teams, structure) {
    this.canvas = canvas;
    this.teams = teams;
    this.structure = structure;
  }
  
  calculateLayout() {
    // Return positioned teams and groups
    throw new Error("Must implement calculateLayout()");
  }
  
  render() {
    // Draw everything to canvas
    throw new Error("Must implement render()");
  }
  
  handleClick(x, y) {
    // Handle click interactions, return clicked team if any
    return null;
  }
  
  handleDrag(teamName, newX, newY) {
    // Handle drag operations (some perspectives may disable)
    return false;
  }
}
```

### New Renderer: Product Lines

**New file**: `frontend/renderer-product-lines.js`
```javascript
/**
 * Product Lines Renderer
 * Layout: Vertical product lanes with teams stacked as cards
 */

import { BaseRenderer } from './renderer-factory.js';
import { drawTeamBox } from './renderer-common.js';

const LAYOUT = {
  laneWidth: 280,
  laneSpacing: 40,
  teamHeight: 100,
  teamSpacing: 20,
  headerHeight: 60,
  padding: 40
};

class ProductLinesRenderer extends BaseRenderer {
  calculateLayout() {
    const products = this.structure.products;
    const productNames = Object.keys(products);
    
    let currentX = LAYOUT.padding;
    const positionedGroups = [];
    const positionedTeams = [];
    
    // Position each product lane
    productNames.forEach((productName, index) => {
      const productData = products[productName];
      const teams = productData.teams;
      
      // Product lane header
      positionedGroups.push({
        type: 'product-lane',
        name: productName,
        x: currentX,
        y: LAYOUT.padding,
        width: LAYOUT.laneWidth,
        height: LAYOUT.headerHeight + (teams.length * (LAYOUT.teamHeight + LAYOUT.teamSpacing)),
        color: productData.metadata.color || '#95a5a6',
        metadata: productData.metadata
      });
      
      // Position teams within lane
      let currentY = LAYOUT.padding + LAYOUT.headerHeight + LAYOUT.teamSpacing;
      teams.forEach(teamName => {
        const team = this.teams.find(t => t.name === teamName);
        if (team) {
          positionedTeams.push({
            ...team,
            x: currentX + 10,
            y: currentY,
            width: LAYOUT.laneWidth - 20,
            height: LAYOUT.teamHeight
          });
          currentY += LAYOUT.teamHeight + LAYOUT.teamSpacing;
        }
      });
      
      currentX += LAYOUT.laneWidth + LAYOUT.laneSpacing;
    });
    
    // Handle teams without product assignment
    if (this.structure.teams_without_product && this.structure.teams_without_product.length > 0) {
      // Add "Unassigned" lane
      // ... similar logic
    }
    
    return { positionedGroups, positionedTeams };
  }
  
  render() {
    const { positionedGroups, positionedTeams } = this.calculateLayout();
    const ctx = this.canvas.getContext('2d');
    
    // Draw product lanes (background containers)
    positionedGroups.forEach(group => {
      this.drawProductLane(ctx, group);
    });
    
    // Draw teams
    positionedTeams.forEach(team => {
      drawTeamBox(ctx, team);  // Reuse common rendering
    });
  }
  
  drawProductLane(ctx, lane) {
    // Draw lane background
    ctx.fillStyle = lane.color + '15';  // Light transparency
    ctx.fillRect(lane.x, lane.y, lane.width, lane.height);
    
    // Draw lane header
    ctx.fillStyle = lane.color;
    ctx.fillRect(lane.x, lane.y, lane.width, LAYOUT.headerHeight);
    
    // Draw product name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(lane.name, lane.x + lane.width / 2, lane.y + LAYOUT.headerHeight / 2);
    
    // Draw product manager if available
    if (lane.metadata.product_manager) {
      ctx.font = '12px Arial';
      ctx.fillText(`PM: ${lane.metadata.product_manager}`, lane.x + lane.width / 2, lane.y + LAYOUT.headerHeight / 2 + 20);
    }
  }
  
  handleDrag(teamName, newX, newY) {
    // Disable dragging in Product Lines view (or enable with lane-switching logic)
    return false;
  }
}

export { ProductLinesRenderer };
```

---

## Testing Strategy

### Backend Tests (pytest)

**New file**: `tests_backend/test_perspectives.py`
```python
"""Tests for organizational perspective services."""

def test_product_lines_structure_basic():
    """Test basic product lines grouping."""
    teams = [
        create_team("Team A", product_line="Product X"),
        create_team("Team B", product_line="Product X"),
        create_team("Team C", product_line="Product Y"),
    ]
    
    structure = get_product_lines_structure(teams)
    
    assert "Product X" in structure["products"]
    assert len(structure["products"]["Product X"]["teams"]) == 2
    assert len(structure["products"]["Product Y"]["teams"]) == 1

def test_product_lines_handles_missing_product():
    """Teams without product_line go to special category."""
    teams = [
        create_team("Team A", product_line="Product X"),
        create_team("Team B"),  # No product_line
    ]
    
    structure = get_product_lines_structure(teams)
    
    assert len(structure["teams_without_product"]) == 1
    assert "Team B" in structure["teams_without_product"]

def test_value_stream_nested_structure():
    """Test nested value stream → product grouping."""
    teams = [
        create_team("Team A", value_stream="VS1", product_line="Product X"),
        create_team("Team B", value_stream="VS1", product_line="Product Y"),
    ]
    
    structure = get_value_stream_structure(teams)
    
    assert "VS1" in structure["value_streams"]
    assert "Product X" in structure["value_streams"]["VS1"]["products"]
```

**Update**: `tests_backend/test_main.py` - add API tests
```python
def test_organizational_structure_product_lines(client):
    """Test product lines perspective API endpoint."""
    response = client.get("/api/organizational-structure?perspective=product-lines")
    assert response.status_code == 200
    data = response.json()
    assert data["perspective"] == "product-lines"
    assert "products" in data
```

### Frontend Tests (Vitest)

**New file**: `frontend/renderer-product-lines.test.js`
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { ProductLinesRenderer } from './renderer-product-lines.js';

describe('ProductLinesRenderer', () => {
  let canvas, teams, structure;
  
  beforeEach(() => {
    canvas = document.createElement('canvas');
    teams = [
      { name: 'Team A', type: 'stream-aligned', organizational_context: { product_line: 'Product X' } },
      { name: 'Team B', type: 'platform', organizational_context: { product_line: 'Product Y' } }
    ];
    structure = {
      products: {
        'Product X': { teams: ['Team A'], metadata: { color: '#3498db' } },
        'Product Y': { teams: ['Team B'], metadata: { color: '#e74c3c' } }
      }
    };
  });
  
  it('should calculate layout with correct lane positions', () => {
    const renderer = new ProductLinesRenderer(canvas, teams, structure);
    const { positionedGroups, positionedTeams } = renderer.calculateLayout();
    
    expect(positionedGroups.length).toBe(2);  // Two product lanes
    expect(positionedTeams.length).toBe(2);   // Two teams
    
    // First lane should be at padding
    expect(positionedGroups[0].x).toBe(40);
    
    // Second lane should be offset by laneWidth + spacing
    expect(positionedGroups[1].x).toBe(40 + 280 + 40);
  });
  
  it('should handle teams without product assignment', () => {
    teams.push({ name: 'Team C', type: 'enabling' });  // No product_line
    structure.teams_without_product = ['Team C'];
    
    const renderer = new ProductLinesRenderer(canvas, teams, structure);
    const { positionedGroups } = renderer.calculateLayout();
    
    // Should have 2 product lanes + 1 "unassigned" lane
    expect(positionedGroups.length).toBe(3);
    expect(positionedGroups[2].name).toContain('Unassigned');
  });
});
```

### E2E Tests (Playwright)

**New file**: `tests/pre-tt-perspectives.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Pre-TT Organizational Perspectives', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000/frontend/');
    
    // Switch to Current State view
    await page.selectOption('#viewMode', 'current-state');
    await page.waitForTimeout(500);
  });
  
  test('should show perspective selector in current state view', async ({ page }) => {
    const perspectiveControl = page.locator('#perspectiveControl');
    await expect(perspectiveControl).toBeVisible();
    
    const selector = page.locator('#orgPerspective');
    await expect(selector).toBeVisible();
  });
  
  test('should switch to product lines perspective', async ({ page }) => {
    await page.selectOption('#orgPerspective', 'product-lines');
    await page.waitForTimeout(1000);
    
    // Should see product lane headers
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Check that URL updates
    expect(page.url()).toContain('perspective=product-lines');
  });
  
  test('should show teams grouped by product', async ({ page }) => {
    await page.selectOption('#orgPerspective', 'product-lines');
    await page.waitForTimeout(1000);
    
    // Click on a team to verify it's clickable
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 150, y: 150 } });
    
    // Team details modal should appear
    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();
  });
  
  test('should persist perspective selection', async ({ page }) => {
    await page.selectOption('#orgPerspective', 'product-lines');
    await page.waitForTimeout(500);
    
    // Reload page
    await page.reload();
    
    // Should remember product-lines perspective
    const selector = page.locator('#orgPerspective');
    const selectedValue = await selector.inputValue();
    expect(selectedValue).toBe('product-lines');
  });
});
```

---

## Migration & Adoption Strategy

### For Existing Installations

**Option 1: Gradual Addition (Recommended)**
- New `organizational_context` fields are optional
- Views work with partial data (teams without product_line appear in "Unassigned" section)
- Hierarchy view continues working exactly as before

**Option 2: Bulk Migration Script**
```python
# scripts/migrate_to_perspectives.py
"""
Interactive script to add product_line to existing teams.
Prompts user for each team's product assignment.
"""
```

### Data Validation

Add validation to ensure data quality:

**Backend validation** (`backend/validation.py`):
```python
def validate_organizational_context(team: Team) -> List[str]:
    """Validate organizational_context fields."""
    warnings = []
    
    if team.organizational_context:
        # Warn if product_line references non-existent product
        if team.organizational_context.product_line:
            if not product_exists(team.organizational_context.product_line):
                warnings.append(f"Product '{team.organizational_context.product_line}' not found in products.json")
        
        # Warn if value_stream references non-existent stream
        if team.organizational_context.value_stream:
            if not value_stream_exists(team.organizational_context.value_stream):
                warnings.append(f"Value stream not found in value-streams.json")
    
    return warnings
```

---

## Bridge to TT-Design: Before/After Comparison

### Conceptual Connection

**Key Insight**: Pre-TT views show *current* organizational reality, TT-Design shows *desired* Team Topologies target state. The gap between them is your transformation roadmap.

### Comparison Features (Phase 3+)

**Comparison View Enhancements**:
1. **"Show me how Product X teams map to TT design"**: Highlight teams in both views
2. **"What organizational changes are needed?"**: Show which teams need to move/restructure
3. **"Current coordination vs. TT interaction modes"**: Map current collaboration patterns to desired TT interactions

**Visual Indicators**:
- Teams that will change reporting structure (different manager)
- Teams that will change product/value stream
- Teams that need to be created (in TT-Design but not in current)
- Teams that will be disbanded/merged

---

## Questions to Answer Before Starting

1. **Consultancy Context**:
   - [ ] Is your current assignment SAFe-based, LeSS-based, or other?
   - [ ] Approximate number of teams in current organization (10? 50? 100+?)
   - [ ] What organizational frameworks are they currently using?

2. **Data Availability**:
   - [ ] Can we easily get product line information for teams?
   - [ ] Do they have value streams defined, or should we skip Phase 2?
   - [ ] Is there existing documentation we can parse?

3. **Stakeholder Needs**:
   - [ ] Who's the primary user of Pre-TT views? (consultants? client stakeholders? both?)
   - [ ] What burning question are they trying to answer with multiple perspectives?
   - [ ] Which perspective would provide most immediate value?

4. **Technical**:
   - [ ] Should perspective selection be per-user (localStorage) or per-snapshot?
   - [ ] Do we need to export all perspectives or just one at a time?

---

## Success Metrics

### Phase 1 Success Criteria
- [ ] User can switch between Hierarchy and Product Lines in <2 seconds
- [ ] Product Lines view clearly shows team-product relationships
- [ ] All existing features (filters, search, team details) work in Product Lines view
- [ ] Tests pass (10 new backend tests, 15 new frontend tests, 5 new E2E tests)
- [ ] Documentation updated with new perspective concept

### Qualitative Success
- [ ] Stakeholders say "now I understand who works on what product"
- [ ] Product managers use Product Lines view to plan capacity
- [ ] Consultants use multiple perspectives to explain transformation needs

---

## Next Steps: Implementation Checklist

### Phase 1 - Week 1
- [ ] Create `products.json` configuration file with example data
- [ ] Add `organizational_context.product_line` to 3-5 example teams
- [ ] Build backend `perspective_services.py` with product lines logic
- [ ] Add `/api/organizational-structure` endpoint
- [ ] Write backend tests (10 tests)

### Phase 1 - Week 2
- [ ] Build perspective selector UI component
- [ ] Create `renderer-factory.js` with factory pattern
- [ ] Implement `ProductLinesRenderer` with layout calculation
- [ ] Write frontend tests (15 tests)
- [ ] Write E2E tests (5 tests)
- [ ] Manual testing with real data

### Phase 1 - Documentation
- [ ] Update CONCEPTS.md with multi-dimensional org theory
- [ ] Update README.md with perspective switching instructions
- [ ] Create migration guide for adding product_line to existing teams
- [ ] Update CHANGELOG.md with design decisions

---

## Design Decisions & Rationale

### Why Start with Product Lines (Not Value Streams)?
- **Universal**: Every org has products/services
- **Simple**: Flat grouping, no complex nesting
- **Immediate value**: Product managers see capacity allocation instantly
- **Low friction**: Just one new field per team

### Why 3 Perspectives (Not 4)?
- Avoids overlap between "Release Train (nested)" and "Release Train (flat)" in original proposal
- Keeps UI simple and purpose-driven
- Can add 4th perspective later if usage patterns demand it

### Why Optional Fields?
- Backward compatibility with existing installations
- Gradual adoption - add data as needed
- Graceful degradation when data missing

### Why Current Team Type?
- Shows "as-is" before TT transformation
- Enables before/after comparison
- Helps identify proto-TT teams (platform teams that could become Platform teams, etc.)

---

## References

- **Team Topologies Book**: Chapter on "Sensing Organization" and Conway's Law
- **SAFe Framework**: Value Streams, ARTs, Program Increments
- **LeSS Framework**: Areas and feature teams
- **Conway's Law**: "Organizations design systems that mirror their communication structure"

---

## Appendix: Visual Mockups

### Product Lines View (Vertical Lanes)
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Product X    │  │ Product Y    │  │ Unassigned   │
│ PM: J. Smith │  │ PM: B. Jones │  │              │
├──────────────┤  ├──────────────┤  ├──────────────┤
│              │  │              │  │              │
│ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │
│ │ Team A   │ │  │ │ Team C   │ │  │ │ Legacy   │ │
│ │ Stream   │ │  │ │ Platform │ │  │ │ Team     │ │
│ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │
│              │  │              │  │              │
│ ┌──────────┐ │  │ ┌──────────┐ │  └──────────────┘
│ │ Team B   │ │  │ │ Team D   │ │
│ │ Stream   │ │  │ │ Enabling │ │
│ └──────────┘ │  │ └──────────┘ │
│              │  │              │
└──────────────┘  └──────────────┘
```

### Value Streams View (Nested Containers) - Phase 2
```
┌─ E-commerce Value Stream ──────────────────────────────────┐
│                                                             │
│  ┌─ Product X ──────────┐    ┌─ Product Y ──────────┐     │
│  │                      │    │                      │     │
│  │  ┌─────────────┐    │    │  ┌─────────────┐    │     │
│  │  │ Team A      │    │    │  │ Team C      │    │     │
│  │  └─────────────┘    │    │  └─────────────┘    │     │
│  │                      │    │                      │     │
│  │  ┌─────────────┐    │    │  ┌─────────────┐    │     │
│  │  │ Team B      │    │    │  │ Team D      │    │     │
│  │  └─────────────┘    │    │  └─────────────┘    │     │
│  │                      │    │                      │     │
│  └──────────────────────┘    └──────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Document Status**: Draft for review  
**Next Action**: Review questions, then start Phase 1 implementation  
**Estimated Total Effort**: Phase 1 = 5-7 days, Phase 2 = 4-6 days
