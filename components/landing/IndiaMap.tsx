
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import {
  STATE_THEMES, BASE_THEME, BRAND_SHLOKA, TOUR_ORDER, themeFor, displayName,
  type Palette, type FontKey,
} from '@/lib/stateThemes';
import { useRegionStore, tourLength } from '@/lib/store/useRegionStore';
import { slugForState } from '@/lib/states/slugs';
import { Link } from 'react-router-dom';
import { Motif, Chakra, Trishul, BorderPatti } from '@/components/ornament/Motifs';

const LABEL_ABBR: Record<string, string> = {
  'Jammu & Kashmir':    'J & K',
  'Andhra Pradesh':     'Andhra Pr.',
  'Arunanchal Pradesh': 'Arunachal Pr.',
  'Himachal Pradesh':   'Himachal Pr.',
  'Madhya Pradesh':     'Madhya Pr.',
  'Uttar Pradesh':      'Uttar Pr.',
  'NCT of Delhi':       'Delhi',
};

/** Territories that sit in open water — they get ripples around them. */
const ISLANDS = ['Andaman & Nicobar Island', 'Lakshadweep'];

const SKIP_LABELS = new Set([
  'Andaman & Nicobar Island', 'Lakshadweep',
  'Daman & Diu', 'Dadara & Nagar Havelli',
  'Puducherry', 'Chandigarh',
]);

/** Display-font stack per regional register — mirrors `FontKey`. */
const FONT_STACK: Record<FontKey, string> = {
  classic: 'var(--font-classic-stack)',
  royal:   'var(--font-royal-stack)',
  temple:  'var(--font-temple-stack)',
  folk:    'var(--font-folk-stack)',
};

/** Pause on the full map before the showcase sets off. */
const OPENING_HOLD = 1600;
/** How long each state is held open during the showcase. */
const STATE_HOLD = 2500;
/** Camera move when the user picks a state — unhurried. */
const FLY_MS = 850;
/** Camera move during the showcase — quicker, so the hold is reading time
    rather than travel time. */
const FLY_TOUR_MS = 560;

/* ── The showcase train ──────────────────────────────────────────────────
   The tour travels by rail. Each leg pulls the camera back far enough to
   show both states, runs the train along the route, then settles into the
   destination. The two moves fit *inside* STATE_HOLD rather than adding to
   it, so the showcase still takes exactly as long as it did before — the
   journey is bought out of the reading pause, not out of the clock. */

/** Where the train sets off from before the first stop. */
const TRAIN_ORIGIN = 'NCT of Delhi';
/** Train run along one leg. */
const RUN_MS = 620;
/** Settling into the destination once the train arrives. */
const ARRIVE_MS = 480;
/** How far the route bows off a straight line, as a share of its length. */
const RAIL_BOW = 0.14;
/** The train is counter-scaled against the camera, so its design size *is*
    its on-screen size. The rake is ~50 units long, so this puts it at
    roughly 90px on screen — big enough to read as coaches, not a smudge. */
const TRAIN_SCALE = 1.9;

/** Scripts that Devanagari faces cannot render — fall back to the Noto set. */
const NON_DEVANAGARI = /[ঀ-෿؀-ۿༀ-࿿]/;

/* ── Colour helpers for the canvas, which cannot read CSS transitions ──── */
type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;

/** Canvas palette — the four pigments the animated field draws with. */
interface Pigments { accent: RGB; secondary: RGB; tertiary: RGB; ink: RGB }

const pigmentsOf = (p: Palette): Pigments => ({
  accent:    hexToRgb(p.accent),
  secondary: hexToRgb(p.secondary),
  tertiary:  hexToRgb(p.tertiary),
  ink:       hexToRgb(p.ink),
});

const lerpInto = (cur: RGB, target: RGB, t: number) => {
  cur[0] += (target[0] - cur[0]) * t;
  cur[1] += (target[1] - cur[1]) * t;
  cur[2] += (target[2] - cur[2]) * t;
};

export default function IndiaMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef    = useRef<SVGSVGElement>(null);
  const zoomRef   = useRef<{
    toIndia: (ms?: number) => void;
    toState: (n: string, ms?: number) => void;
    /** Runs the showcase train from one state to the next, then settles. */
    runLeg: (from: string, to: string) => void;
    hideTrain: () => void;
  }>({ toIndia: () => {}, toState: () => {}, runLeg: () => {}, hideTrain: () => {} });
  /** The stop the train is standing at, so each leg knows where it starts. */
  const trainAtRef = useRef<string | null>(null);
  /** Repaints every state path when the theme changes. */
  const restyleRef = useRef<(() => void) | null>(null);
  /** Selection read by the d3 closures below, which are built only once. */
  const selectedRef = useRef<string | null>(null);
  /** Captured before the URL is rewritten, so a shared link still resolves. */
  const initialHash = useRef<string | null>(
    typeof window === 'undefined' ? null : decodeURIComponent(window.location.hash.slice(1)) || null,
  );

  /* The navbar, the map, deep links, and the showcase all write here. */
  const activeState    = useRegionStore(s => s.selected);
  const tour           = useRegionStore(s => s.tour);
  const tourIndex      = useRegionStore(s => s.tourIndex);
  const select         = useRegionStore(s => s.select);
  const selectFromTour = useRegionStore(s => s.selectFromTour);
  const setTour        = useRegionStore(s => s.setTour);
  const stopTour       = useRegionStore(s => s.stopTour);
  const setCameraState = useRegionStore(s => s.setCameraState);

  const [hoverState, setHoverState] = useState<string | null>(null);
  const [loading,    setLoading]    = useState(true);
  /** True once the geometry is drawn and the camera can be driven. */
  const [ready,      setReady]      = useState(false);

  /* d3's handlers are bound once, so they reach the store through a ref. */
  const selectRef = useRef(select);
  selectRef.current = select;
  /* Read by the camera effect without making the phase one of its deps. */
  const touringRef = useRef(false);
  touringRef.current = tour === 'running';

  /* The selected state's cultural identity — Madhubani when nothing is picked. */
  const theme   = useMemo(() => themeFor(activeState), [activeState]);
  const palette = activeState ? theme.colors : BASE_THEME;
  const isPrimary = Boolean(theme.primary);

  /* Live palette for d3 + canvas, which live outside React's render. */
  const paletteRef = useRef<Palette>(palette);
  paletteRef.current = palette;
  selectedRef.current = activeState;

  const pigmentTarget = useRef<Pigments>(pigmentsOf(palette));
  useEffect(() => { pigmentTarget.current = pigmentsOf(palette); }, [palette]);

  /* Repaint the map whenever the active state (and so the palette) changes. */
  useEffect(() => { restyleRef.current?.(); }, [activeState]);

  /* ── Canvas: mandalas, kolam dots, ocean streams ───────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dead = false;
    let raf  = 0;

    /* A phone repaints this field every frame on battery, so scale the work
       down with the screen. Desktop keeps the full density. */
    const small = window.innerWidth < 640;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    let W = window.innerWidth;
    let H = window.innerHeight;

    const size = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      canvas.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    window.addEventListener('resize', size);

    /* Pigments the field currently paints with — eased toward the theme. */
    const cur: Pigments = pigmentsOf(paletteRef.current);
    const wheel: (keyof Pigments)[] = ['accent', 'secondary', 'tertiary', 'accent', 'secondary'];

    /* Mandalas — slow-turning rangoli wheels. */
    type Mandala = { x: number; y: number; r: number; rot: number; speed: number; hue: keyof Pigments; petals: number };
    const mandalas: Mandala[] = Array.from({ length: small ? 4 : 7 }, (_, i) => ({
      x:      Math.random() * W,
      y:      Math.random() * H,
      r:      80 + Math.random() * 140,
      rot:    Math.random() * Math.PI * 2,
      speed:  (0.0008 + Math.random() * 0.0014) * (Math.random() > 0.5 ? 1 : -1),
      hue:    wheel[i % wheel.length],
      petals: 6 + Math.floor(Math.random() * 4),
    }));

    const drawMandala = (ctx: CanvasRenderingContext2D, m: Mandala) => {
      const c = cur[m.hue];
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rot);

      for (let i = 0; i < m.petals; i++) {
        ctx.save();
        ctx.rotate((i / m.petals) * Math.PI * 2);
        ctx.beginPath();
        ctx.ellipse(0, m.r * 0.55, m.r * 0.18, m.r * 0.48, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(c, 0.075);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
      for (let ring = 1; ring <= 4; ring++) {
        ctx.beginPath();
        ctx.arc(0, 0, (m.r * ring) / 4, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(c, 0.055 - ring * 0.008);
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.beginPath();
      for (let i = 0; i <= m.petals; i++) {
        const a = (i / m.petals) * Math.PI * 2;
        const px = Math.cos(a) * m.r * 0.3;
        const py = Math.sin(a) * m.r * 0.3;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = rgba(c, 0.08);
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    };

    /* Kolam dot lattice — the threshold grid, pulsing. */
    const COLS = small ? 11 : 18, ROWS = small ? 7 : 11;
    const dotGrid = Array.from({ length: ROWS * COLS }, (_, i) => ({
      cx: ((i % COLS) + 0.5) / COLS,
      cy: (Math.floor(i / COLS) + 0.5) / ROWS,
      hue: wheel[i % wheel.length],
      phase: (i * 0.41) % (Math.PI * 2),
    }));

    /* The three seas, drawn as flowing line-work. */
    const drawSeas = (ctx: CanvasRenderingContext2D, t: number) => {
      ctx.save();
      ctx.lineWidth = 1;
      const sea = cur.tertiary;

      for (let i = 0; i < 5; i++) {
        const x0 = W * (0.022 + i * 0.018);
        const amp = 9 + i * 4, wl = 65 + i * 18, ph = t * (0.009 + i * 0.002);
        ctx.beginPath();
        for (let y = 0; y <= H; y += 4) {
          const x = x0 + Math.sin(y / wl + ph) * amp;
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(sea, 0.10 - i * 0.014);
        ctx.stroke();
      }

      for (let i = 0; i < 5; i++) {
        const x0 = W * (0.978 - i * 0.018);
        const amp = 9 + i * 4, wl = 65 + i * 18, ph = t * (0.009 + i * 0.002) + Math.PI;
        ctx.beginPath();
        for (let y = 0; y <= H; y += 4) {
          const x = x0 + Math.sin(y / wl + ph) * amp;
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(sea, 0.10 - i * 0.014);
        ctx.stroke();
      }

      for (let i = 0; i < 4; i++) {
        const y0 = H * (0.965 - i * 0.016);
        const amp = 10 + i * 5, wl = 110 + i * 25, ph = t * (0.006 + i * 0.002);
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const y = y0 + Math.sin(x / wl + ph) * amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(sea, 0.085 - i * 0.013);
        ctx.stroke();
      }
      ctx.restore();
    };

    let t = 0;
    const tick = () => {
      if (dead) return;
      raf = requestAnimationFrame(tick);
      t++;

      /* Ease the pigments toward the active theme — the canvas cross-fades
         in step with the CSS custom-property transition. */
      const target = pigmentTarget.current;
      lerpInto(cur.accent,    target.accent,    0.045);
      lerpInto(cur.secondary, target.secondary, 0.045);
      lerpInto(cur.tertiary,  target.tertiary,  0.045);
      lerpInto(cur.ink,       target.ink,       0.045);

      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, W, H);

      for (const d of dotGrid) {
        const pulse = Math.sin(t * 0.012 + d.phase) * 0.5 + 0.5;
        ctx.fillStyle = rgba(cur[d.hue], 0.03 + pulse * 0.05);
        ctx.beginPath();
        ctx.arc(d.cx * W, d.cy * H, 1.4 + pulse * 1.0, 0, Math.PI * 2);
        ctx.fill();
      }

      drawSeas(ctx, t);

      for (const m of mandalas) {
        m.rot += m.speed;
        drawMandala(ctx, m);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => { dead = true; cancelAnimationFrame(raf); window.removeEventListener('resize', size); };
  }, []);

  /* ── SVG India map ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (!svgRef.current) return;
    let dead = false;
    let removeResize = () => {};

    (async () => {
      const d3 = await import('d3');
      const { geoMercator, geoPath, select, zoom: d3zoom, zoomIdentity, json, easeCubicInOut } = d3;
      if (dead) return;

      const svg = svgRef.current!;
      let W = svg.clientWidth  || window.innerWidth;
      let H = svg.clientHeight || window.innerHeight;

      const d3svg = select(svg);
      d3svg.selectAll('*').remove();

      const defs = d3svg.append('defs');

      /* Glow on the selected state — a diya held behind the paper. */
      const glowPrimary = defs.append('filter')
        .attr('id', 'glow-primary').attr('x', '-40%').attr('y', '-40%').attr('width', '180%').attr('height', '180%');
      const glowBlur = glowPrimary.append('feGaussianBlur')
        .attr('in', 'SourceGraphic').attr('stdDeviation', '5').attr('result', 'blur');
      const fmp = glowPrimary.append('feMerge');
      fmp.append('feMergeNode').attr('in', 'blur');
      fmp.append('feMergeNode').attr('in', 'SourceGraphic');

      const hoverGlow = defs.append('filter').attr('id', 'glow-hover')
        .attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
      const drop = hoverGlow.append('feDropShadow')
        .attr('dx', 0).attr('dy', 0).attr('stdDeviation', '10').attr('flood-opacity', '0.55');

      /* Woven texture for the selected state — a kolam dot on a diagonal
         weave, recoloured to whichever tradition is open. */
      const fillPattern = defs.append('pattern')
        .attr('id', 'kk-weave')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 9).attr('height', 9);
      const patternGround = fillPattern.append('rect')
        .attr('width', 9).attr('height', 9);
      const patternMarks = fillPattern.append('g')
        .attr('fill', 'none').attr('stroke-width', 0.6);
      patternMarks.append('path').attr('d', 'M0 9 L9 0 M-2 2 L2 -2 M7 11 L11 7');
      patternMarks.append('circle').attr('cx', 4.5).attr('cy', 4.5).attr('r', 1.1);

      const root     = d3svg.append('g').attr('class', 'root');
      const rippleG  = root.append('g').attr('class', 'ripples').attr('pointer-events', 'none');
      const statesG  = root.append('g').attr('class', 'states');
      const labelsG  = root.append('g').attr('class', 'labels').attr('pointer-events', 'none');
      /* Above the labels: during a leg the train is the thing being watched. */
      const railG    = root.append('g').attr('class', 'rail').attr('pointer-events', 'none');

      /* Line-work and labels are counter-scaled on zoom so the map keeps a
         constant hairline weight instead of thickening into blobs. */
      let applyScale: (k: number) => void = () => {};
      let scale = 1;
      /* Assigned once the train exists, further down; the zoom handler runs
         before then only when there is nothing to place. */
      let placeTrainRef: () => void = () => {};

      const zb = d3zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.4, 20])
        .on('zoom', ev => {
          root.attr('transform', ev.transform.toString());
          scale = ev.transform.k;
          applyScale(scale);
          
          if (ev.sourceEvent) {
            const px = (W / 2 - ev.transform.x) / scale;
            const py = (H / 2 - ev.transform.y) / scale;
            const lonlat = proj.invert ? proj.invert([px, py]) : null;
            if (lonlat) {
              setCameraState({ center: [lonlat[0], lonlat[1]], zoom: scale });
            }
          }
        });
      d3svg.call(zb);
      d3svg.on('dblclick.zoom', null);

      const statesData: any = await json('/india-states.geojson');
      if (dead) return;
      setLoading(false);

      /* Fit the projection to the element's current size. Called again on
         resize and orientation change — geoPath holds a reference to the
         projection, so refitting in place keeps `path` valid. */
      const proj = geoMercator();
      const path = geoPath(proj);

      const fitProjection = () => {
        W = svg.clientWidth  || window.innerWidth;
        H = svg.clientHeight || window.innerHeight;
        /* On wide screens the hero occupies the left third, so the map is
           fitted to the remaining space rather than dead-centre. */
        const leftInset = W >= 1024 ? 0.28 : 0.04;
        proj.fitExtent([[W * leftInset, H * 0.05], [W * 0.97, H * 0.96]], statesData);
      };
      fitProjection();
      
      const savedCamera = useRegionStore.getState().cameraState;
      if (savedCamera) {
        const [px, py] = proj(savedCamera.center) || [0, 0];
        const tx = W / 2 - px * savedCamera.zoom;
        const ty = H / 2 - py * savedCamera.zoom;
        d3svg.call(zb.transform, zoomIdentity.translate(tx, ty).scale(savedCamera.zoom));
      }

      const sName = (d: any): string => d?.properties?.ST_NM ?? '';

      /* Every state is tinted with its *own* tradition's accent, at a whisper;
         the selected one comes up to full pigment. */
      const own = (name: string) => STATE_THEMES[name]?.colors ?? BASE_THEME;
      const isSelected = (name: string) => selectedRef.current === name;


      const baseFill = (d: any) => {
        const n = sName(d);
        const c = hexToRgb(own(n).secondary); // Use secondary for a softer pastel highlight
        if (isSelected(n)) return 'url(#kk-weave)';
        return rgba(c, 0.45); // Higher opacity so it stands out against dark maroon
      };

      /* Recolour the weave to the open tradition. */
      const tintPattern = () => {
        const p = selectedRef.current ? own(selectedRef.current) : BASE_THEME;
        patternGround.attr('fill', rgba(hexToRgb(p.secondary), 0.25));
        patternMarks.attr('stroke', rgba(hexToRgb(p.secondary), 0.75));
      };
      tintPattern();
      const baseStroke = (d: any) => {
        const n = sName(d);
        const c = hexToRgb(own(n).secondary);
        if (isSelected(n)) return rgba(c, 0.95);
        return rgba(c, 0.75);
      };
      const baseWidth  = (d: any) => (isSelected(sName(d)) ? 1.2 : 0.6);
      const labelSize  = (d: any) => (isSelected(sName(d)) ? 8.5 : 6);
      const baseFilter = (d: any) => (isSelected(sName(d)) ? 'url(#glow-primary)' : null);
      const labelFill  = (d: any) => {
        const n = sName(d);
        const c = hexToRgb(own(n).ink);
        if (isSelected(n)) return rgba(hexToRgb(own(n).accent), 0.95);
        return rgba(c, 0.55);
      };

      const paths = statesG.selectAll<SVGPathElement, any>('path')
        .data(statesData.features)
        .enter().append('path')
        .attr('d',      (d: any) => path(d) ?? '')
        .attr('fill',   baseFill)
        .attr('stroke', baseStroke)
        .attr('stroke-width', baseWidth)
        .attr('filter', baseFilter)
        .style('cursor', 'pointer')
        .style('transition', 'fill 0.45s ease, stroke 0.45s ease')
        .on('mouseenter', function (_, d: any) {
          const n = sName(d);
          const c = hexToRgb(own(n).accent);
          drop.attr('flood-color', own(n).accent);
          select(this)
            .attr('fill',   rgba(c, 0.45))
            .attr('stroke', rgba(c, 0.95))
            .attr('stroke-width', 1.5 / scale)
            .attr('filter', 'url(#glow-hover)')
            .classed('state-holo', true);
          setHoverState(n);
        })
        .on('mouseleave', function (_, d: any) {
          select(this)
            .attr('fill',   baseFill(d))
            .attr('stroke', baseStroke(d))
            .attr('stroke-width', baseWidth(d) / scale)
            .attr('filter', baseFilter(d))
            .classed('state-holo', false);
          setHoverState(null);
        })
        .on('click', (_, d: any) => selectRef.current(sName(d)));

      const labels = labelsG.selectAll('text')
        .data(statesData.features.filter((f: any) => !SKIP_LABELS.has(f.properties?.ST_NM)))
        .enter().append('text')
        .attr('x', (d: any) => path.centroid(d)[0])
        .attr('y', (d: any) => path.centroid(d)[1] + 8) // Push label down slightly to make room for image
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', labelFill)
        .attr('font-size', (d: any) => `${labelSize(d)}px`)
        .attr('font-weight', (d: any) => (isSelected(sName(d)) ? '600' : '400'))
        .attr('letter-spacing', '0.3')
        .style('font-family', 'var(--font-sans-stack)')
        .style('transition', 'fill 0.45s ease')
        .text((d: any) => LABEL_ABBR[sName(d)] ?? sName(d));

      labelsG.selectAll('image')
        .data(statesData.features.filter((f: any) => !SKIP_LABELS.has(f.properties?.ST_NM) && themeFor(sName(f))?.crafts?.[0]))
        .enter().append('image')
        .attr('x', (d: any) => path.centroid(d)[0] - 8)
        .attr('y', (d: any) => path.centroid(d)[1] - 12)
        .attr('width', 16)
        .attr('height', 16)
        .attr('href', (d: any) => {
          const stateName = sName(d);
          const craftName = themeFor(stateName).crafts[0];
          return `/api/wiki-image?q=${encodeURIComponent(craftName + ' ' + stateName)}`;
        })
        .style('pointer-events', 'none') // Ensure it doesn't block map clicks
        .style('opacity', 0.85);

      /* Ring radius for an island cluster, in projected pixels. */
      const rippleRadius = (geom: any) => Math.max(3.5, Math.sqrt(path.area(geom)) * 1.5);

      /* ── Island water ──────────────────────────────────────────────────
         Rings spreading out from the Andamans and Lakshadweep, so the two
         island territories sit in moving water rather than on blank paper.
         They live inside the zoom group, so they stay pinned to the islands;
         non-scaling strokes keep them a hairline at every zoom. */
      ISLANDS.forEach(name => {
        const feat = statesData.features.find((f: any) => sName(f) === name);
        if (!feat) return;

        /* One ring set per island cluster rather than one for the whole
           chain — the Andamans span 800km, and a single ring around all of
           them would sweep across the mainland. */
        const polys: any[] = feat.geometry?.type === 'MultiPolygon'
          ? feat.geometry.coordinates.map((c: any) => ({ type: 'Polygon', coordinates: c }))
          : [feat.geometry];

        const clusters = polys
          .map(geom => ({ geom, area: path.area(geom as any) }))
          .filter(c => c.area > 0.15)
          .sort((a, b) => b.area - a.area)
          .slice(0, 8);

        const g = rippleG.append('g')
          .attr('class', 'kk-ripples')
          .attr('data-island', name);

        clusters.forEach((c, ci) => {
          const [cx, cy] = path.centroid(c.geom as any);
          if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;
          /* Start just outside the island itself. */
          const r0 = rippleRadius(c.geom);

          const set = g.append('g')
            .attr('class', 'kk-ripple-set')
            .datum(c.geom)
            .attr('transform', `translate(${cx}, ${cy})`);
          for (let i = 0; i < 3; i++) {
            set.append('circle')
              .attr('r', r0)
              .attr('fill', 'none')
              .attr('stroke', 'var(--kk-tertiary)')
              .attr('vector-effect', 'non-scaling-stroke')
              .attr('stroke-width', 1)
              /* Stagger both within a set and between clusters, so the water
                 never pulses in unison. */
              .style('animation-delay', `${i * 2.4 + ci * 0.7}s`)
              .classed('kk-ripple', true);
          }
        });
      });

      /* Keep hairlines and labels at a constant on-screen weight. */
      applyScale = (k: number) => {
        paths.attr('stroke-width', (d: any) => baseWidth(d) / k);
        /* Pattern tiles and filter radii live in user space, so they inflate
           with the zoom unless they are divided back out. */
        fillPattern.attr('patternTransform', `scale(${1 / k})`);
        glowBlur.attr('stdDeviation', 5 / k);
        drop.attr('stdDeviation', 10 / k);
        labels
          .attr('font-size', (d: any) => `${labelSize(d) / k}px`)
          .attr('letter-spacing', 0.3 / k);
        /* The train is drawn in map space too, so it inflates like the rest. */
        placeTrainRef();
      };

      /* Restyle hook — React calls this when the selection changes. */
      restyleRef.current = () => {
        tintPattern();
        rippleG.selectAll<SVGGElement, unknown>('.kk-ripples')
          .classed('is-open', function () {
            return this.getAttribute('data-island') === selectedRef.current;
          });
        paths
          .attr('fill', baseFill)
          .attr('stroke', baseStroke)
          .attr('filter', baseFilter);
        labels
          .attr('fill', labelFill)
          .attr('font-weight', (d: any) => (isSelected(sName(d)) ? '600' : '400'));
        applyScale(scale);
      };

      /* These move the camera only. What is *selected* lives in the store,
         and an effect below drives the camera from it — so nav clicks, map
         clicks, deep links, and the showcase all travel the same path. */
      const toState = (name: string, ms = FLY_MS) => {
        const feat = statesData.features.find((f: any) => sName(f) === name);
        if (!feat) return;
        const [[x0, y0], [x1, y1]] = path.bounds(feat);
        /* On a narrow screen the nav sits above the map and the panel covers
           the lower part of it, so frame the state in the band between them
           rather than dead-centre — otherwise it opens behind the panel. */
        const narrow = W < 900;
        const topChrome = narrow ? 108 : 0;           /* nav + control row */
        const panelH = narrow
          ? Math.min(H * (H < 520 ? 0.46 : 0.62), 480) /* mirrors the CSS caps */
          : 0;
        const bandTop = topChrome;
        const bandBot = H - panelH;
        const bandH   = Math.max(bandBot - bandTop, 120);
        const cy      = narrow ? (bandTop + bandBot) / 2 : H / 2;
        const k  = 0.78 / Math.max((x1 - x0) / W, (y1 - y0) / bandH);
        const tx = W / 2 - k * (x0 + x1) / 2;
        const ty = cy    - k * (y0 + y1) / 2;
        d3svg.transition().duration(ms).ease(easeCubicInOut)
          .call(zb.transform, zoomIdentity.translate(tx, ty).scale(k));
      };

      const toIndia = (ms = 680) => {
        d3svg.transition().duration(ms).ease(easeCubicInOut)
          .call(zb.transform, zoomIdentity);
      };

      /* ── The showcase train ─────────────────────────────────────────────
         Drawn in map space so it sits on the country rather than floating
         over it, which means it inflates with the zoom exactly as the
         pattern tiles and labels do. `place()` divides the camera scale back
         out on every frame — including mid-flight, when the camera is moving
         underneath the train. */

      const centroidOf = (name: string): [number, number] | null => {
        const feat = statesData.features.find((f: any) => sName(f) === name);
        if (!feat) return null;
        const [cx, cy] = path.centroid(feat);
        return Number.isFinite(cx) && Number.isFinite(cy) ? [cx, cy] : null;
      };

      const rail = railG.append('path')
        .attr('class', 'kk-rail-line')
        .attr('fill', 'none')
        .attr('stroke-dasharray', '3 4')
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('stroke-width', 1)
        .attr('opacity', 0);

      /* A Namo Bharat–style rake: a tapered driving car and two trailers, in a
         continuous window band with a livery stripe under it. Drawn once
         around the origin, nose pointing +x, and thereafter only transformed.
         Units are map-space; `place` divides the camera scale back out.

         Colours come from the open tradition's palette, never from literals,
         so the train re-liveries as the showcase moves across the country. */
      const train = railG.append('g').attr('class', 'kk-train').attr('opacity', 0);

      const H_CAR = 9;          /* body height          */
      const L_CAR = 13;         /* coach length         */
      const GAP   = 1.6;        /* coupling gap         */
      const NOSE  = 4.5;        /* how far the cab tapers */

      /** A trailer: plain rounded box. */
      const trailer = (x: number) =>
        train.append('rect')
          .attr('class', 'kk-car')
          .attr('x', x).attr('y', -H_CAR / 2)
          .attr('width', L_CAR).attr('height', H_CAR)
          .attr('rx', 2).attr('vector-effect', 'non-scaling-stroke');

      /** The driving car, with the raked nose that reads as modern rail. */
      const drivingCar = (x: number) => {
        const f = x + L_CAR;
        const h = H_CAR / 2;
        train.append('path')
          .attr('class', 'kk-car')
          .attr('vector-effect', 'non-scaling-stroke')
          .attr('d',
            `M${x},${-h} H${f - NOSE}` +
            `C${f - 1},${-h} ${f + NOSE},${-h * 0.55} ${f + NOSE},0` +
            `C${f + NOSE},${h * 0.55} ${f - 1},${h} ${f - NOSE},${h}` +
            `H${x} Z`);
      };

      /** Window band and livery stripe, the two things that make it read. */
      const dress = (x: number, w: number) => {
        train.append('rect')
          .attr('class', 'kk-glass')
          .attr('x', x + 1.4).attr('y', -H_CAR / 2 + 1.5)
          .attr('width', w - 2.8).attr('height', 3)
          .attr('rx', 1);
        train.append('rect')
          .attr('class', 'kk-livery')
          .attr('x', x + 1).attr('y', H_CAR / 2 - 2.6)
          .attr('width', w - 2).attr('height', 1.5)
          .attr('rx', 0.7);
      };

      const CARS = [-34, -34 + L_CAR + GAP, -34 + 2 * (L_CAR + GAP)];
      trailer(CARS[0]);
      trailer(CARS[1]);
      drivingCar(CARS[2]);
      CARS.forEach(x => dress(x, L_CAR));

      /* Bogies, drawn under the bodies so the rake sits on something. */
      [-31, -24, -16.5, -9.5, -2, 5].forEach(x =>
        train.insert('rect', ':first-child')
          .attr('class', 'kk-bogie')
          .attr('x', x).attr('y', H_CAR / 2 - 0.6)
          .attr('width', 3.2).attr('height', 1.8).attr('rx', 0.8));

      let trainPos: { x: number; y: number; a: number } | null = null;

      const place = () => {
        if (!trainPos) return;
        train.attr(
          'transform',
          `translate(${trainPos.x},${trainPos.y}) rotate(${trainPos.a}) scale(${TRAIN_SCALE / scale})`,
        );
      };

      placeTrainRef = place;

      const paintTrain = () => {
        const p = selectedRef.current ? own(selectedRef.current) : BASE_THEME;
        const accent = hexToRgb(p.accent);
        const paper  = hexToRgb(p.paper);
        const ink    = hexToRgb(p.ink);

        /* Pale body, accent outline, dark glass, accent stripe — the shape
           does the work, so the livery stays quiet against the map. */
        train.selectAll('.kk-car')
          .attr('fill', rgba(paper, 0.97)).attr('stroke', rgba(accent, 0.95)).attr('stroke-width', 1);
        train.selectAll('.kk-glass').attr('fill', rgba(ink, 0.45));
        train.selectAll('.kk-livery').attr('fill', rgba(accent, 0.9));
        train.selectAll('.kk-bogie').attr('fill', rgba(ink, 0.55));
        rail.attr('stroke', rgba(accent, 0.5));
      };

      /* Fading and moving are separate named transitions. Two unnamed
         transitions on the same selection cancel one another, which silently
         left the train running the route at opacity 0. */
      const hideTrain = () => {
        train.interrupt('fade').interrupt('move').attr('opacity', 0);
        rail.interrupt('fade').attr('opacity', 0);
        trainPos = null;
      };

      /** Frames both ends of a leg, so the journey is actually visible. */
      const toLeg = (a: [number, number], b: [number, number], ms: number) => {
        const pad = 90;
        const x0 = Math.min(a[0], b[0]) - pad, x1 = Math.max(a[0], b[0]) + pad;
        const y0 = Math.min(a[1], b[1]) - pad, y1 = Math.max(a[1], b[1]) + pad;
        const k = Math.min(6, 0.9 / Math.max((x1 - x0) / W, (y1 - y0) / H));
        d3svg.transition().duration(ms).ease(easeCubicInOut)
          .call(zb.transform,
            zoomIdentity.translate(W / 2 - k * (x0 + x1) / 2, H / 2 - k * (y0 + y1) / 2).scale(k));
      };

      const runLeg = (fromName: string, toName: string) => {
        const a = centroidOf(fromName);
        const b = centroidOf(toName);
        /* An unknown endpoint is not worth failing over — just fly there. */
        if (!a || !b) { hideTrain(); toState(toName, FLY_TOUR_MS); return; }

        paintTrain();

        /* A shallow bow perpendicular to the leg. A dead-straight line across
           a country reads as a chart annotation; a curve reads as a route. */
        const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
        const len = Math.hypot(dx, dy) || 1;
        const mx = (a[0] + b[0]) / 2 - (dy / len) * len * RAIL_BOW;
        const my = (a[1] + b[1]) / 2 + (dx / len) * len * RAIL_BOW;
        rail.attr('d', `M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`);

        const node = rail.node();
        if (!node) { hideTrain(); toState(toName, FLY_TOUR_MS); return; }
        const total = node.getTotalLength();

        rail.interrupt('fade').attr('opacity', 0)
          .transition('fade').duration(220).attr('opacity', 1);

        /* The train stays on the map for the whole showcase — it pulls in,
           waits, and departs. Only its first appearance is a fade; blinking
           it off and on at every stop would undo the sense of one journey. */
        if (+(train.attr('opacity') || 0) < 0.99) {
          train.interrupt('fade').transition('fade').duration(260).attr('opacity', 1);
        }

        toLeg(a, b, RUN_MS);

        train.interrupt('move').transition('move').duration(RUN_MS).ease(easeCubicInOut)
          .attrTween('transform', () => (t: number) => {
            const at = node.getPointAtLength(t * total);
            /* Heading from a point just ahead, so the engine leans into the
               curve instead of sliding sideways along it. */
            const ahead = node.getPointAtLength(Math.min(total, t * total + 1.5));
            const angle = (Math.atan2(ahead.y - at.y, ahead.x - at.x) * 180) / Math.PI;
            trainPos = { x: at.x, y: at.y, a: angle };
            return `translate(${at.x},${at.y}) rotate(${angle}) scale(${TRAIN_SCALE / scale})`;
          })
          .on('end', () => {
            /* Arrived: the route behind it fades, the train stands at the
               platform, and the camera settles into the state. */
            rail.transition('fade').duration(ARRIVE_MS).attr('opacity', 0);
            paintTrain();
            toState(toName, ARRIVE_MS);
          });
      };

      /* Re-fit on resize and orientation change. Without this the map keeps
         the geometry it was built with and runs off-screen once the viewport
         changes — most visibly when a phone is rotated. */
      const relayout = () => {
        fitProjection();
        /* The route was computed in the old projection; a rotated phone would
           otherwise leave a train running along a line that no longer exists. */
        hideTrain();
        paths.attr('d', (d: any) => path(d) ?? '');
        labels
          .attr('x', (d: any) => path.centroid(d)[0])
          .attr('y', (d: any) => path.centroid(d)[1]);
        rippleG.selectAll<SVGGElement, any>('g.kk-ripple-set').each(function (geom: any) {
          const [cx, cy] = path.centroid(geom);
          if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;
          select(this)
            .attr('transform', `translate(${cx}, ${cy})`)
            .selectAll('circle').attr('r', rippleRadius(geom));
        });
        /* Put the camera back where it was, at the new size. */
        const sel = selectedRef.current;
        if (sel) toState(sel, 0);
        else     toIndia(0);
      };

      let resizeTimer: ReturnType<typeof setTimeout>;
      const onResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(relayout, 150);
      };
      window.addEventListener('resize', onResize);
      window.addEventListener('orientationchange', onResize);
      removeResize = () => {
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onResize);
      };

      zoomRef.current = { toIndia, toState, runLeg, hideTrain };
      setReady(true);

      /* Deep link — /#Tamil%20Nadu opens straight into that tradition,
         and skips the opening showcase. */
      const fromHash = initialHash.current;
      if (fromHash && STATE_THEMES[fromHash]) selectRef.current(fromHash);
    })();

    return () => { dead = true; restyleRef.current = null; removeResize(); };
  }, []);

  const close = useCallback(() => select(null), [select]);

  /* Follow the URL when it changes under us — an edited or pasted hash, or a
     link to another tradition from elsewhere on the page. */
  useEffect(() => {
    const onHash = () => {
      const name = decodeURIComponent(window.location.hash.slice(1));
      if (name && STATE_THEMES[name]) select(name);
      else if (!name) select(null);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [select]);

  /* Keep the URL in step with the selection, so a tradition can be shared. */
  useEffect(() => {
    const url = activeState
      ? `#${encodeURIComponent(activeState)}`
      : window.location.pathname + window.location.search;
    window.history.replaceState(null, '', url);
  }, [activeState]);

  /* Escape returns to the full map. */
  useEffect(() => {
    if (!activeState) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeState, close]);

  /* The camera follows the store. `ready` is in the deps so a selection made
     before the geometry loaded (a deep link) is honoured once it arrives. */
  useEffect(() => {
    if (!ready) return;

    /* During the showcase the camera travels by rail: the leg is shown, the
       train runs it, and `runLeg` settles into the destination itself. Every
       other route into the camera — a click, the navbar, a deep link — flies
       straight there as before. */
    if (touringRef.current && activeState) {
      const from = trainAtRef.current ?? TRAIN_ORIGIN;
      trainAtRef.current = activeState;
      if (from === activeState) zoomRef.current.toState(activeState, FLY_TOUR_MS);
      else                      zoomRef.current.runLeg(from, activeState);
      return;
    }

    trainAtRef.current = null;
    zoomRef.current.hideTrain();
    if (activeState) zoomRef.current.toState(activeState);
    else             zoomRef.current.toIndia();
  }, [activeState, ready]);

  /* Leaving the showcase — by clicking, scrolling, or reaching the end — puts
     the train away. Without this it would sit frozen on the last leg. */
  useEffect(() => {
    if (tour === 'running') return;
    trainAtRef.current = null;
    zoomRef.current.hideTrain();
  }, [tour]);

  /* ── The opening showcase ───────────────────────────────────────────────
     Land on the whole map, hold, then travel state by state. Any deliberate
     input — a click, a key, a scroll, the navbar — hands control back. */
  useEffect(() => {
    if (tour === 'idle') return;
    const stop = () => stopTour();
    window.addEventListener('pointerdown', stop);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('keydown', stop);
    return () => {
      window.removeEventListener('pointerdown', stop);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('keydown', stop);
    };
  }, [tour, stopTour]);

  useEffect(() => {
    if (!ready) return;
    if (tour !== 'pending') return;
    /* A deep-linked visit is not a showcase. */
    if (activeState) { stopTour(); return; }
    /* Nor is it one for anyone who has asked for less movement — they can
       still start it deliberately from the control. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { stopTour(); return; }
    const t = setTimeout(() => setTour('running'), OPENING_HOLD);
    return () => clearTimeout(t);
  }, [ready, tour, activeState, setTour, stopTour]);

  useEffect(() => {
    if (tour !== 'running' || !ready) return;
    const next = tourIndex + 1;
    /* The first stop comes quickly; later ones hold long enough to read. */
    const delay = tourIndex < 0 ? 250 : STATE_HOLD;
    const t = setTimeout(() => {
      if (next >= TOUR_ORDER.length) { select(null); return; }
      selectFromTour(TOUR_ORDER[next], next);
    }, delay);
    return () => clearTimeout(t);
  }, [tour, tourIndex, ready, select, selectFromTour]);

  const hoverTheme = hoverState ? themeFor(hoverState) : null;
  const panelName  = activeState ? displayName(activeState) : null;
  /* Only states with a data file under lib/states have a dedicated page. */
  const pageSlug   = slugForState(activeState);
  const hoverName  = hoverState  ? displayName(hoverState)  : null;
  const scriptClass = theme.script.native && NON_DEVANAGARI.test(theme.script.native) ? 'kk-indic' : 'kk-deva';

  /* Theme slots handed to CSS — every themed rule reads from these. */
  const themeVars = {
    '--kk-paper':      palette.paper,
    '--kk-paper-deep': palette.paperDeep,
    '--kk-ink':        palette.ink,
    '--kk-ink-soft':   palette.inkSoft,
    '--kk-accent':     palette.accent,
    '--kk-secondary':  palette.secondary,
    '--kk-tertiary':   palette.tertiary,
    '--kk-line':       palette.line,
    '--kk-font-display': FONT_STACK[theme.font],
  } as Record<string, string>;

  /* Applied at the document root rather than on the stage, so chrome outside
     the map — the navbar and its state menu — carries the same theme. */
  useEffect(() => {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(themeVars)) root.style.setProperty(k, v);
  });

  const touring = tour === 'running';

  return (
    <div className="kk-stage" data-tour={touring ? 'true' : 'false'}>

      {/* Animated pigment field — mandalas, kolam dots, seas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      />

      {/* Corner ornaments — Krishna's chakra, Shiva's trishul, the state's motif */}
      <Chakra className="kk-corner kk-corner--tr kk-spin-slow" size={132} strokeWidth={1} />
      <Trishul className="kk-corner kk-corner--bl" size={92} strokeWidth={1.1} />
      <Motif
        name={theme.motif}
        className="kk-corner kk-corner--br kk-breathe"
        size={108}
        strokeWidth={1.1}
      />

      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3, pointerEvents: 'none' }}>
          <span className="kk-label" style={{ color: 'var(--kk-accent)', animation: 'pulse-glow 1.4s ease-in-out infinite' }}>
            प्रतीक्षा · Loading
          </span>
        </div>
      )}

      {/* Hero — retires once a state is selected */}
      <header className="kk-hero" data-hidden={activeState ? 'true' : 'false'} aria-hidden={activeState ? 'true' : 'false'}>
        <p className="kk-hero-eyebrow kk-label">GI-Tagged · Artisan Direct</p>
        <h1 className="kk-hero-title">
          The living hand<br />of India
        </h1>
        <p className="kk-hero-deva kk-deva" title={BRAND_SHLOKA.meaning}>
          {BRAND_SHLOKA.native}
        </p>
        <p className="kk-hero-lede">
          Every region of this map keeps its own line, its own pigment, its own
          story. KalaSetu begins in Mithila — where Madhubani has been painted
          on walls and paper for five unbroken centuries — and travels outward.
        </p>
        <p className="kk-hero-hint kk-label">Choose a state to enter its tradition</p>
      </header>

      {/* The map */}
      <svg
        ref={svgRef}
        className="kk-map"
        role="img"
        aria-label="Map of India — select a state to see its craft traditions"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
      />

      {activeState && (
        <button className="kk-btn kk-back" onClick={close}>
          ← All States
        </button>
      )}

      {/* Showcase readout — doubles as the control to stop or restart it */}
      {ready && (
        <div className="kk-tour">
          {touring ? (
            <button className="kk-btn kk-tour-btn" onClick={stopTour}>
              ❚❚ Showcase · {Math.max(tourIndex + 1, 1)} / {tourLength}
            </button>
          ) : (
            <button
              className="kk-btn kk-tour-btn"
              onClick={() => { selectFromTour(TOUR_ORDER[0], 0); setTour('running'); }}
            >
              ▶ Cultural showcase
            </button>
          )}
        </div>
      )}

      {/* Hover readout */}
      {hoverState && !activeState && hoverTheme && (
        <div className="kk-hoverlabel">
          <span className="kk-hoverlabel-name">{hoverName}</span>
          <span className="kk-hoverlabel-art">{hoverTheme.art}</span>
        </div>
      )}

      {/* State panel */}
      <section
        className="kk-panel"
        data-open={activeState ? 'true' : 'false'}
        aria-hidden={activeState ? 'false' : 'true'}
        aria-label={panelName ? `${panelName} — craft traditions` : undefined}
      >
        <BorderPatti className="kk-panel-patti" height={14} />

        {activeState && (
          <div className="kk-panel-body" key={activeState}>
            <Motif name={theme.motif} className="kk-panel-watermark" size={190} strokeWidth={0.9} />

            {/* Identity */}
            <div className="kk-panel-col">
              <p className="kk-panel-kicker kk-label">
                <Motif name={theme.motif} size={13} strokeWidth={2.2} />
                {isPrimary ? 'Primary Region · KalaSetu' : 'Heritage Region · India'}
              </p>
              <h2 className="kk-panel-name">{panelName}</h2>
              <p className={`kk-panel-script ${scriptClass}`}>{theme.script.native}</p>
              <p className="kk-panel-translit">
                {theme.script.roman} — {theme.script.meaning}
              </p>
            </div>

            {/* Story + the Sanskrit line that sits with this tradition */}
            <div className="kk-panel-col">
              <p className="kk-panel-desc">{theme.description}</p>
              <figure className="kk-shloka">
                <p className="kk-shloka-line kk-deva">{theme.shloka.native}</p>
                <figcaption className="kk-shloka-caption">
                  <span className="kk-shloka-roman">{theme.shloka.roman}</span>
                  <span className="kk-shloka-meaning">{theme.shloka.meaning}</span>
                  <cite className="kk-shloka-source">{theme.shloka.source}</cite>
                </figcaption>
              </figure>
            </div>

            {/* Crafts */}
            <div className="kk-panel-col">
              <p className="kk-panel-art">{theme.art}</p>
              <div className="kk-chips">
                {theme.crafts.map((c) => (
                  <span key={c.name} className={`kk-chip${c.featured ? ' kk-chip--lead' : ''}`}>{c.name}</span>
                ))}
              </div>
              {pageSlug && (
                <Link className="kk-panel-explore" href={`/state/${pageSlug}`}>
                  Explore {panelName} →
                </Link>
              )}
            </div>

            <button className="kk-btn kk-panel-close" onClick={close} aria-label="Close panel">✕</button>
          </div>
        )}
      </section>
    </div>
  );
}
