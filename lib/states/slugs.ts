/**
 * State ⇄ URL slug, and nothing else.
 *
 * Deliberately free of the catalogue data files: the landing map and the
 * navbar both need to know *whether* a state has a page, and importing the
 * registry would pull every state's content into the bundle for every route.
 * `STATE_THEMES` is already in that bundle, so deriving from it is free.
 *
 * Every state in the cultural registry has a page — a researched one where
 * the content exists, an overview built from the registry otherwise.
 */

import { STATE_THEMES, displayName } from '@/lib/stateThemes';

/** `NCT of Delhi` → `delhi`, `Jammu & Kashmir` → `jammu-and-kashmir`. */
export function slugify(state: string): string {
  return displayName(state)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** State name → slug. */
export const STATE_PAGE_SLUGS: Record<string, string> = Object.fromEntries(
  Object.keys(STATE_THEMES).map(state => [state, slugify(state)]),
);

/** Slug → state name, for resolving a URL back to a registry entry. */
export const SLUG_TO_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_PAGE_SLUGS).map(([state, slug]) => [slug, state]),
);

/** The page slug for a STATE_THEMES key, or null when the name is unknown. */
export function slugForState(state: string | null | undefined): string | null {
  return (state && STATE_PAGE_SLUGS[state]) || null;
}
