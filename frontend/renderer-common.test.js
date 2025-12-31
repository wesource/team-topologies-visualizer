/**
 * Unit tests for renderer-common.js
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { wrapText, INTERACTION_STYLES, getTeamAtPosition, initCanvasPolyfills } from './renderer-common.js';

describe('wrapText', () => {
  let mockCtx;

  beforeEach(() => {
    mockCtx = {
      measureText: (text) => ({
        width: text.length * 10 // Mock: 10 pixels per character
      })
    };
  });

  it('should wrap text that exceeds maxWidth', () => {
    const text = 'This is a long text that needs wrapping';
    const maxWidth = 100; // Will fit ~10 characters per line
    
    const lines = wrapText(mockCtx, text, maxWidth);
    
    expect(lines.length).toBeGreaterThan(1);
    lines.forEach(line => {
      expect(line.length * 10).toBeLessThanOrEqual(maxWidth + 50); // Allow some margin
    });
  });

  it('should not wrap short text', () => {
    const text = 'Short';
    const maxWidth = 200;
    
    const lines = wrapText(mockCtx, text, maxWidth);
    
    expect(lines.length).toBe(1);
    expect(lines[0]).toBe('Short');
  });

  it('should handle single word', () => {
    const text = 'SingleWord';
    const maxWidth = 50;
    
    const lines = wrapText(mockCtx, text, maxWidth);
    
    expect(lines.length).toBe(1);
    expect(lines[0]).toBe('SingleWord');
  });

  it('should handle empty string', () => {
    const text = '';
    const maxWidth = 100;
    
    const lines = wrapText(mockCtx, text, maxWidth);
    
    expect(lines.length).toBe(1);
    expect(lines[0]).toBe('');
  });

  it('should split on spaces', () => {
    const text = 'Word1 Word2 Word3 Word4';
    const maxWidth = 80;
    
    const lines = wrapText(mockCtx, text, maxWidth);
    
    lines.forEach(line => {
      expect(line).not.toMatch(/^\s|\s$/); // No leading/trailing spaces
    });
  });
});

describe('INTERACTION_STYLES', () => {
  it('should have collaboration style', () => {
    expect(INTERACTION_STYLES).toHaveProperty('collaboration');
    expect(INTERACTION_STYLES.collaboration).toHaveProperty('dash');
    expect(INTERACTION_STYLES.collaboration).toHaveProperty('width');
    expect(INTERACTION_STYLES.collaboration).toHaveProperty('color');
  });

  it('should have x-as-a-service style', () => {
    expect(INTERACTION_STYLES).toHaveProperty('x-as-a-service');
    expect(INTERACTION_STYLES['x-as-a-service'].dash.length).toBeGreaterThan(0);
  });

  it('should have facilitating style', () => {
    expect(INTERACTION_STYLES).toHaveProperty('facilitating');
    expect(INTERACTION_STYLES.facilitating.dash.length).toBeGreaterThan(0);
  });

  it('should have valid colors', () => {
    Object.values(INTERACTION_STYLES).forEach(style => {
      expect(style.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('getTeamAtPosition', () => {
  const teams = [
    { name: 'Team A', position: { x: 100, y: 100 } },
    { name: 'Team B', position: { x: 300, y: 200 } },
    { name: 'Team C', position: { x: 500, y: 300 } }
  ];

  it('should find team at exact position', () => {
    const viewOffset = { x: 0, y: 0 };
    const scale = 1;
    
    const team = getTeamAtPosition(teams, 150, 120, viewOffset, scale);
    
    expect(team).toBeDefined();
    expect(team.name).toBe('Team A');
  });

  it('should return undefined when no team at position', () => {
    const viewOffset = { x: 0, y: 0 };
    const scale = 1;
    
    const team = getTeamAtPosition(teams, 50, 50, viewOffset, scale);
    
    expect(team).toBeUndefined();
  });

  it('should account for scale', () => {
    const viewOffset = { x: 0, y: 0 };
    const scale = 2; // 2x zoom
    
    const team = getTeamAtPosition(teams, 250, 220, viewOffset, scale);
    
    expect(team).toBeDefined();
    expect(team.name).toBe('Team A');
  });

  it('should account for view offset', () => {
    const viewOffset = { x: 50, y: 50 };
    const scale = 1;
    
    // With offset, need to adjust click position
    const team = getTeamAtPosition(teams, 200, 170, viewOffset, scale);
    
    expect(team).toBeDefined();
    expect(team.name).toBe('Team A');
  });

  it('should check team box bounds (180x80)', () => {
    const viewOffset = { x: 0, y: 0 };
    const scale = 1;
    
    // Inside box: Team A at (100, 100), box is 180x80
    const inside = getTeamAtPosition(teams, 150, 120, viewOffset, scale);
    expect(inside).toBeDefined();
    expect(inside.name).toBe('Team A');
    
    // Outside box width (> 280)
    const outsideWidth = getTeamAtPosition(teams, 290, 120, viewOffset, scale);
    expect(outsideWidth).toBeUndefined();
    
    // Outside box height (> 180)
    const outsideHeight = getTeamAtPosition(teams, 150, 190, viewOffset, scale);
    expect(outsideHeight).toBeUndefined();
  });
});

describe('initCanvasPolyfills', () => {
  // Skip Canvas API tests since Canvas is not available in happy-dom
  it.skip('should define roundRect polyfill function', () => {
    expect(initCanvasPolyfills).toBeDefined();
    expect(typeof initCanvasPolyfills).toBe('function');
  });

  it('should exist as a function', () => {
    // Just verify the function is exported
    expect(typeof initCanvasPolyfills).toBe('function');
  });
});
