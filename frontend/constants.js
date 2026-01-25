// Shared layout constants for consistent positioning across renderers and alignment logic

export const LAYOUT = {
    // Vertical spacing
    COMPANY_Y: 50,                  // Y position of company leadership level
    LEVEL_HEIGHT: 120,              // Vertical spacing between hierarchy levels
    VERTICAL_SPACING: 120,          // Spacing between teams under same manager

    // Box dimensions
    DEPT_BOX_WIDTH: 200,            // Department/Line Manager box width
    DEPT_BOX_HEIGHT: 80,            // Department/Line Manager box height
    TEAM_BOX_WIDTH: 144,            // Team box width (reduced for better spacing)
    TEAM_BOX_HEIGHT: 80,            // Team box height

    // Org-chart positioning
    ORG_CHART_VERTICAL_LINE_OFFSET: 1/5,   // Vertical line position (1/5 from left of manager box)
    ORG_CHART_TEAM_X_OFFSET: 2/5,          // Team X position (2/5 from left of manager box)

    // Department/Line Manager spacing
    DEPT_SPACING: 230,              // Horizontal spacing between departments (balanced for compact layout)
    LINE_MANAGER_SPACING: 180,      // Horizontal spacing between line managers (balanced for compact layout)

    // Base positions
    DEPT_START_X: 550,              // Starting X position for departments (500 + 50 margin)

    // Border styling
    BORDER_WIDTH_NORMAL: 3,         // Normal border width
    BORDER_WIDTH_SELECTED: 4,       // Selected item border width
    BORDER_COLOR_DARKEN_FACTOR: 0.7 // Factor to darken fill color for borders (70% of original)
};
