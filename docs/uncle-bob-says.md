# 🧔 If I Were Uncle Bob (Robert C. Martin)...

A Clean Code critique of the Team Topologies Visualizer codebase.

*Generated: January 2026*

---

## Top 3 Things to Fix

### 1. Functions Are Too Long and Do Too Many Things

**The Violation**: The Single Responsibility Principle (SRP) is being stretched. 

Look at `parse_team_file()` in `services.py` - it's ~130 lines doing:
- File reading
- YAML parsing  
- Validation
- Metadata flattening
- Field extraction from multiple sources
- Markdown table parsing
- Fallback logic for dependencies

Similarly, `drawTeam()` in `renderer-common.js` handles focus mode, team shapes, cognitive load, flow metrics, comparison highlighting, etc.

**Uncle Bob says**: *"A function should do one thing. It should do it well. It should do it only."*

**Suggested fix**: Extract smaller, focused functions:
```python
# Instead of one giant parse_team_file():
def parse_team_file(file_path):
    content = read_file_content(file_path)
    yaml_data, markdown = split_front_matter(content)
    team = build_team_from_yaml(yaml_data, file_path)
    team = enrich_with_markdown(team, markdown)
    return validate_team(team)
```

---

### 2. Primitive Obsession & Data Clumps in Function Signatures

**The Violation**: Functions take 10+ parameters and you're passing primitive values around.

In `renderer.js`, `drawProductLinesView` takes 11 parameters:
```javascript
drawProductLinesView(
    state.ctx,
    state.productLinesData,
    teamsToRender,
    state.teamColorMap,
    (text, maxWidth) => wrapText(state.ctx, text, maxWidth),
    state.showCognitiveLoad,
    state.productLinesTeamPositions,
    state.showTeamTypeBadges,
    state.selectedTeam,
    state.focusedTeam,
    state.focusedConnections
)
```

**Uncle Bob says**: *"More than three arguments requires very special justification."*

**Suggested fix**: Use an options object (you already started doing this in `drawTeam(ctx, team, options = {})` - but it's inconsistent):
```javascript
drawProductLinesView(ctx, data, { teams, colors, showCognitiveLoad, ... })
```

---

### 3. The Global State Object is a God Object

**The Violation**: The `state` object in `state-management.js` holds **everything** - canvas, teams, views, filters, snapshots, comparison, history, focus mode... 50+ properties.

This makes it:
- Hard to reason about what's changing
- Difficult to test in isolation
- A magnet for coupling (everything imports `state`)

**Uncle Bob says**: *"Classes should be small. Functions should be small. The first rule of classes is that they should be small."*

**Suggested fix**: Split state into domain-specific modules:
```javascript
// canvas-state.js
export const canvasState = { canvas, ctx, scale, viewOffset }

// team-state.js  
export const teamState = { teams, selectedTeam, teamColorMap }

// filter-state.js
export const filterState = { selectedFilters, interactionModeFilters }
```

---

## 🏆 What Uncle Bob Would Praise

1. **Excellent test coverage** (713 tests!) - you're practicing TDD
2. **Small, focused files** - you've split renderers by domain (baseline, TT, common)
3. **Clear naming** - functions like `getFilteredTeams()`, `calculatePlatformConsumers()`, `parse_team_file()` tell you what they do
4. **Constants are extracted** - `LAYOUT`, `INTERACTION_STYLES` avoid magic numbers

---

## The Verdict

This is **solid "real-world" code** - better than most! The issues above are refinements, not blockers. For a 1.0 release, you're in great shape. 🚀

---

## References

- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) by Robert C. Martin
- [The Clean Coder](https://www.amazon.com/Clean-Coder-Conduct-Professional-Programmers/dp/0137081073) by Robert C. Martin
