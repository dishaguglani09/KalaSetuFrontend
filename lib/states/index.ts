/**
 * Registry of state pages.
 *
 * Every state in the cultural registry has a page. Those with a researched
 * data file get the full treatment — district map, craft stories, shop,
 * experiences, tourism. Every other state falls back to an overview derived
 * from `lib/stateThemes.ts`.
 *
 * Adding depth to a state is therefore one file plus one line here; nothing
 * about the route, the metadata or the components has to change.
 */

import type { StatePage } from './types';
import { bihar } from './bihar';
import { derivePage } from './derive';
import { SLUG_TO_STATE, STATE_PAGE_SLUGS } from './slugs';

export { slugForState, STATE_PAGE_SLUGS, slugify } from './slugs';

/** Slug → the hand-written pages. Keyed by URL segment. */
export const STATE_PAGES: Record<string, StatePage> = {
  bihar,
};

/** True when the state has a researched catalogue rather than an overview. */
export function isDetailed(slug: string): boolean {
  return slug in STATE_PAGES;
}

export function statePage(slug: string): StatePage | undefined {
  const written = STATE_PAGES[slug];
  if (written) return written;
  const state = SLUG_TO_STATE[slug];
  return state ? derivePage(state) : undefined;
}

/** Every slug, for generateStaticParams — all 36, not just the written ones. */
export function stateSlugs(): string[] {
  return Object.values(STATE_PAGE_SLUGS);
}

export type { StatePage } from './types';
