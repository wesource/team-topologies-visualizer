import { describe, it, expect } from 'vitest';

// Mock DOM elements needed by modals.js
global.document = {
    getElementById: () => null,
    createElement: (tag) => ({
        innerHTML: '',
        style: {},
        classList: { add: () => {}, remove: () => {} }
    })
};

// Import the function we're testing
// Note: We'll need to export renderMarkdownTables from modals.js
import { renderMarkdownTables } from './modals.js';

describe('renderMarkdownTables', () => {
    it('should render a simple 2-column table', () => {
        const markdown = `| Name | Value |
|------|-------|
| Foo  | Bar   |
| Baz  | Qux   |`;

        const html = renderMarkdownTables(markdown);
        
        expect(html).toContain('<table');
        expect(html).toContain('<th>Name</th>');
        expect(html).toContain('<th>Value</th>');
        expect(html).toContain('<td>Foo</td>');
        expect(html).toContain('<td>Bar</td>');
    });

    it('should render a 4-column table with multiple pipes in separator', () => {
        const markdown = `| Team Name | Interaction Mode | Purpose | Duration |
|-----------|------------------|---------|----------|
| DevOps Enablement Team | Facilitating | Cloud-native deployment | 8 weeks |
| Data Platform Team | X-as-a-Service | Data persistence | Ongoing |`;

        const html = renderMarkdownTables(markdown);
        
        expect(html).toContain('<table');
        expect(html).toContain('<th>Team Name</th>');
        expect(html).toContain('<th>Interaction Mode</th>');
        expect(html).toContain('<th>Purpose</th>');
        expect(html).toContain('<th>Duration</th>');
        expect(html).toContain('<td>DevOps Enablement Team</td>');
        expect(html).toContain('<td>Facilitating</td>');
    });

    it('should render table with blank line before it', () => {
        const markdown = `## Teams we currently interact with

| Team Name | Mode |
|-----------|------|
| Team A    | X-as-a-Service |`;

        const html = renderMarkdownTables(markdown);
        
        expect(html).toContain('<table');
        expect(html).toContain('<th>Team Name</th>');
        expect(html).toContain('<td>Team A</td>');
    });

    it('should handle tables with alignment markers in separator', () => {
        const markdown = `| Left | Center | Right |
|:-----|:------:|------:|
| A    | B      | C     |`;

        const html = renderMarkdownTables(markdown);
        
        expect(html).toContain('<table');
        expect(html).toContain('<th>Left</th>');
        expect(html).toContain('<th>Center</th>');
        expect(html).toContain('<th>Right</th>');
    });

    it('should not modify text without tables', () => {
        const text = 'This is plain text without any tables.';
        const result = renderMarkdownTables(text);
        expect(result).toBe(text);
    });

    it('should handle multiple tables in same text', () => {
        const markdown = `First table:

| A | B |
|---|---|
| 1 | 2 |

Second table:

| X | Y |
|---|---|
| 3 | 4 |`;

        const html = renderMarkdownTables(markdown);
        
        const tableCount = (html.match(/<table/g) || []).length;
        expect(tableCount).toBe(2);
    });

    it('should handle empty cells', () => {
        const markdown = `| Name | Value |
|------|-------|
| Foo  |       |
|      | Bar   |`;

        const html = renderMarkdownTables(markdown);
        
        expect(html).toContain('<table');
        expect(html).toContain('<td>Foo</td>');
        expect(html).toContain('<td></td>');
    });
});
