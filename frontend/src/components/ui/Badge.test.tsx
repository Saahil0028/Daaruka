import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { Badge } from './Badge';

describe('Badge Component', () => {
  it('renders badge children text correctly', () => {
    const html = renderToString(<Badge variant="emerald">Active</Badge>);
    expect(html).toContain('Active');
    expect(html).toContain('text-emerald-300');
  });

  it('applies custom variant classes', () => {
    const html = renderToString(<Badge variant="amber">Planning</Badge>);
    expect(html).toContain('Planning');
    expect(html).toContain('text-amber-300');
  });
});
