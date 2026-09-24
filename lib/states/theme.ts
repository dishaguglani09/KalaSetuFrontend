/**
 * Theme slots for a state page.
 *
 * The landing map writes these onto the document root at runtime. A state page
 * is server-rendered, so it sets the same slots as inline custom properties on
 * its own wrapper — no client JS, and the palette is correct in the very first
 * paint rather than after hydration.
 */

import { BASE_THEME, STATE_THEMES, type FontKey } from '@/lib/stateThemes';

const FONT_STACK: Record<FontKey, string> = {
  classic: 'var(--font-classic-stack)',
  royal:   'var(--font-royal-stack)',
  temple:  'var(--font-temple-stack)',
  folk:    'var(--font-folk-stack)',
};

/** CSS custom properties for a STATE_THEMES key, ready to spread onto style. */
export function stateThemeVars(state: string): React.CSSProperties {
  const theme = STATE_THEMES[state];
  const c = theme?.colors ?? BASE_THEME;
  return {
    '--kk-paper':        c.paper,
    '--kk-paper-deep':   c.paperDeep,
    '--kk-ink':          c.ink,
    '--kk-ink-soft':     c.inkSoft,
    '--kk-accent':       c.accent,
    '--kk-secondary':    c.secondary,
    '--kk-tertiary':     c.tertiary,
    '--kk-line':         c.line,
    '--kk-font-display': FONT_STACK[theme?.font ?? 'classic'],
  } as React.CSSProperties;
}
