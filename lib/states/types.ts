/**
 * Shapes for a state page.
 *
 * One state = one data file exporting a `StatePage`. Everything the page
 * renders comes from that object, so adding Odisha or Gujarat later is a data
 * exercise rather than a component exercise. Ids are the joins: a product
 * names its craft, a craft names its district, and a district id must match the
 * geojson property named by `districtProperty`.
 */

import type { MotifKey } from '@/lib/stateThemes';

/**
 * A photograph, where one earns its place.
 *
 * Every image slot on a state page falls back to the entry's motif when this
 * is absent, so the page is complete before a single photograph exists and
 * upgrades one asset at a time. Paths are under /public and therefore
 * same-origin — no CSP change, no remote loader.
 */
export interface ImageAsset {
  /** Path under /public, e.g. /img/bihar/madhubani.jpg */
  src: string;
  dynamicSearch?: string;
  /** Required: these images carry meaning, not decoration. */
  alt: string;
  /** Intrinsic size, so the browser reserves the box and nothing shifts. */
  width: number;
  height: number;
  /** Which part of the frame to keep when the crop is tight. */
  focal?: 'top' | 'center' | 'bottom';
  /** Shown small under the frame when licensing requires it. */
  credit?: string;
}

/** A district on the map, and what it is known for. */
export interface District {
  /** Must match the geojson feature property exactly (e.g. NAME_2). */
  id: string;
  /** Shown to the reader — the geojson spelling is not always the nice one. */
  name: string;
  /** One line, shown when the district is selected. */
  note: string;
  /** Craft ids rooted in this district. */
  crafts: string[];
}

/** A living craft tradition, told as a story rather than a spec. */
export interface Craft {
  id: string;
  name: string;
  /** Devanagari or local script, shown alongside the name. */
  native?: string;
  /** District id this tradition is rooted in. */
  district: string;
  /** GI registration label, when the craft carries one. */
  gi?: string;
  motif: MotifKey;
  /** The hook — one sentence that earns the reader's attention. */
  hook: string;
  /** Origin and meaning: where it comes from and why it exists. */
  story: string;
  /** How it is actually made. */
  technique: string;
  /** Who makes it. */
  makers: string;
  /** The making, not the finished object, is what earns a photograph here. */
  image?: ImageAsset;
}

/** Something we sell. Prices are placeholder catalogue values. */
export interface Product {
  id: string;
  name: string;
  /** Craft id — this is what ties a product to its story. */
  craft: string;
  /** Indian rupees. */
  price: number;
  /** Unit or size qualifier, e.g. "250 g" or "22 × 30 in". */
  spec: string;
  blurb: string;
  gi?: string;
  /** Optional flag such as "Limited" or "Made to order". */
  tag?: string;
  /** Overrides the craft's motif, so pieces from one craft do not all
      carry the same mark. */
  motif?: MotifKey;
  /** Left empty deliberately while prices are placeholders: a motif reads as
      design, a stand-in photograph reads as a broken product listing. */
  image?: ImageAsset;
}

/** A bookable experience — the other half of the commerce. */
export interface Experience {
  id: string;
  name: string;
  district: string;
  duration: string;
  price: number;
  blurb: string;
  motif: MotifKey;
  image?: ImageAsset;
}

/** Somewhere to go. Tourism supports the crafts; it does not lead. */
export interface Destination {
  id: string;
  name: string;
  district: string;
  /** Short category label, e.g. "UNESCO World Heritage". */
  kind: string;
  blurb: string;
  /** Real places have to look real; a motif here reads as a placeholder. */
  image?: ImageAsset;
}

/** A narrative beat in the state's story. */
export interface Chapter {
  title: string;
  body: string;
  motif: MotifKey;
}

export interface StatePage {
  /** URL segment: /state/<slug>. */
  slug: string;
  /** Key into STATE_THEMES — the page inherits that palette and typography. */
  state: string;
  title: string;
  /** Native-script line under the title. */
  native: string;
  tagline: string;
  intro: string;
  /** Wide, dark-tolerant: the title sits over it. */
  hero?: ImageAsset;

  /* Everything below is optional, and the page renders only the sections it
     actually has data for. A state with a researched catalogue gets the full
     page; one that only has an entry in STATE_THEMES gets an honest overview
     rather than a scaffold of empty headings. */

  /** Path under /public. Only states with district geometry have one. */
  geojson?: string;
  /** Geojson property holding the district name. */
  districtProperty?: string;
  districts?: District[];

  chapters?: Chapter[];
  crafts?: Craft[];
  products?: Product[];
  experiences?: Experience[];
  destinations?: Destination[];

  /** Craft names only, for states whose traditions are not yet written up.
      Drawn from the cultural registry, so it is real data and not a stub. */
  craftNames?: string[];
}
