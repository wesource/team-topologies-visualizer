# Auto-Align Functionality

## Overview
The auto-align feature automatically positions teams in the TT Design view based on Team Topologies flow-of-change principles, with optional hints for fine-grained control.

## Alignment Hints (Optional)

Add to team metadata in markdown files:

```yaml
metadata:
  align_hint_x: left    # or center, right
  align_hint_y: top     # or bottom
```

**Both hints are optional.** The system uses intelligent defaults based on team types.

## How Hints Work

### Grouping-Level Positioning
- **One hint guides all teams**: If any team in a grouping has a hint, it applies to the entire grouping
- **3-column grid**: Groupings are positioned in left, center, or right columns based on `align_hint_x`
- **2-row layout**: Groupings positioned in top or bottom rows based on `align_hint_y`

### Within-Grouping Positioning
- **Wide teams** (stream-aligned, platform): Stack vertically at the same X coordinate
- **Narrow teams** (enabling, complicated-subsystem): Position horizontally side by side
- **Horizontal alignment**: `align_hint_x` controls X position within the grouping box

## Defaults

### Grouping Position
- **Value streams**: Top row (customer-facing)
- **Platform groupings**: Bottom row, center column (foundational)

### Team Position Within Grouping
- **Platform teams**: Center-aligned
- **Stream-aligned teams**: Left-aligned
- **Enabling/complicated-subsystem**: Left-aligned

### Ungrouped Teams
- **Positioned separately** on the left side of canvas (x=100)
- **Type-based offsets**: Platform left, stream-aligned right, enabling left

## Layout Grid

```
Top Row:    [Left]         [Center]        [Right]
            x=700          x=1550          x=2400

Bottom Row: [Left]         [Center]        [Right]
            x=700          x=1550          x=2400

Ungrouped:  x=100 (separate zone)
```

## Example Usage

```yaml
# Position entire "Mobile Experience" grouping to the right
# Add to ANY team in the grouping:
metadata:
  align_hint_x: right
  align_hint_y: bottom
```

This positions the entire grouping in the bottom-right area, with all teams in that grouping following the hint.
