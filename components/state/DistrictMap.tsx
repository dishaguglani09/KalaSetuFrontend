'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExtendedFeature, ExtendedFeatureCollection } from 'd3';
import type { District } from '@/lib/states/types';
import { useRegionStore } from '@/lib/store/useRegionStore';

/* d3's own geo types, so this file needs no `any` — the landing map's
   exemption is deliberately not extended here. */
type Feat = ExtendedFeature<never, Record<string, string>>;

/** Camera framing: how much of the box a zoomed district fills, and the cap. */
const FILL = 0.62;
const MAX_K = 7;
const FLY_MS = 700;

/**
 * District map for a state page — the interactive focal point.
 *
 * Selecting a district flies the camera to it and opens a panel *over* the
 * map, so the readout reads as part of the map rather than as a second column
 * standing next to it. That is also what reclaims the whitespace: the map now
 * spans the full width instead of sharing the row with a mostly-empty column.
 *
 * Zooming an SVG is the trap this project has already hit — stroke widths and
 * label sizes scale with the camera. Both are handled explicitly:
 * `vector-effect="non-scaling-stroke"` pins the strokes, and label font-size
 * is transitioned to `base / k` alongside the camera so text holds its size.
 *
 * The camera is a plain transform on the group, not d3-zoom: there is no user
 * pan or pinch, so a touch gesture can never fight the page scroll.
 *
 * Hover feedback is written straight to the DOM rather than through React —
 * a pointermove that sets state would re-render the whole panel on every
 * frame.
 */
export default function DistrictMap({
  geojson,
  districtProperty,
  districts,
}: {
  geojson: string;
  districtProperty: string;
  districts: District[];
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  /** d3 binds handlers once; React state reaches them through these refs. */
  const selectRef = useRef<(id: string | null) => void>(() => {});
  selectRef.current = (id: string | null) => setSelected(cur => (cur === id ? null : id));

  const byId = useRef(new Map(districts.map(d => [d.id, d])));
  const applyRef = useRef<(() => void) | null>(null);
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selected;
  
  const setCameraState = useRegionStore(s => s.setCameraState);

  /* One effect drives both the camera and the styling, so they never disagree
     about which district is open. */
  useEffect(() => { applyRef.current?.(); }, [selected]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let dead = false;
    let teardown = () => {};

    (async () => {
      const [d3, res] = await Promise.all([import('d3'), fetch(geojson)]);
      if (dead) return;
      if (!res.ok) { setStatus('error'); return; }
      const data = (await res.json()) as ExtendedFeatureCollection;
      if (dead) return;

      const { geoMercator, geoPath, select, zoom: d3zoom, zoomIdentity, easeCubicInOut } = d3;
      const features = data.features as Feat[];

      const d3svg = select(svg);
      d3svg.selectAll('*').remove();

      const proj = geoMercator();
      const path = geoPath(proj);
      const cam = d3svg.append('g');
      
      let scale = 1;
      
      const zb = d3zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.4, 20])
        .on('zoom', ev => {
          cam.attr('transform', ev.transform.toString());
          scale = ev.transform.k;
          
          if (ev.sourceEvent) {
             const px = (w / 2 - ev.transform.x) / scale;
             const py = (h / 2 - ev.transform.y) / scale;
             const lonlat = proj.invert ? proj.invert([px, py]) : null;
             if (lonlat) {
               setCameraState({ center: [lonlat[0], lonlat[1]], zoom: scale });
             }
          }
          
          paths.attr('stroke-width', d => (isOpen(d) ? 1.6 : 0.6) / scale);
          labels.attr('font-size', 8 / scale);
        });
        
      d3svg.call(zb);
      d3svg.on('dblclick.zoom', null);

      const name = (d: Feat): string => d.properties?.[districtProperty] ?? '';
      const known = (d: Feat) => byId.current.has(name(d));
      const isOpen = (d: Feat) => name(d) === selectedRef.current;

      let w = 640;
      let h = 420;

      const paths = cam.selectAll<SVGPathElement, Feat>('path')
        .data(features)
        .enter().append('path')
        /* Pins stroke width against the camera scale. */
        .attr('vector-effect', 'non-scaling-stroke')
        .style('cursor', d => (known(d) ? 'pointer' : 'default'))
        .style('transition', 'fill 0.25s ease, fill-opacity 0.25s ease, stroke 0.25s ease')
        .attr('tabindex', d => (known(d) ? 0 : null))
        .attr('role', d => (known(d) ? 'button' : null))
        .attr('aria-label', d => (known(d) ? name(d) : null))
        .on('click', (_, d) => { if (known(d)) selectRef.current(name(d)); })
        .on('keydown', (ev: KeyboardEvent, d) => {
          if (known(d) && (ev.key === 'Enter' || ev.key === ' ')) {
            ev.preventDefault();
            selectRef.current(name(d));
          }
        });

      /* Hover: tooltip for craft districts only, so the pointer teaches which
         shapes are live before you click one. */
      paths
        .on('pointerenter', (ev: PointerEvent, d) => {
          const tip = tipRef.current;
          if (!tip || !known(d) || ev.pointerType === 'touch') return;
          const rec = byId.current.get(name(d));
          const n = rec?.crafts.length ?? 0;
          tip.textContent = `${rec?.name ?? name(d)} · ${n} ${n === 1 ? 'craft' : 'crafts'}`;
          tip.setAttribute('data-on', '');
        })
        .on('pointermove', (ev: PointerEvent, d) => {
          const tip = tipRef.current;
          if (!tip || !known(d)) return;
          const box = svg.getBoundingClientRect();
          tip.style.transform =
            `translate(${ev.clientX - box.left}px, ${ev.clientY - box.top}px)`;
        })
        .on('pointerleave', () => tipRef.current?.removeAttribute('data-on'));

      const labels = cam.selectAll<SVGTextElement, Feat>('text')
        .data(features.filter(known))
        .enter().append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('pointer-events', 'none')
        .attr('letter-spacing', 0.2)
        .style('font-family', 'var(--font-sans-stack)')
        .style('transition', 'fill 0.25s ease')
        .text(d => byId.current.get(name(d))?.name ?? '');

      /** Camera transform framing one district, or the whole state. */
      const frame = (d: Feat | null) => {
        if (!d) return { k: 1, x: 0, y: 0 };
        const [[x0, y0], [x1, y1]] = path.bounds(d);
        const k = Math.min(MAX_K, FILL * Math.min(w / (x1 - x0), h / (y1 - y0)));
        return { k, x: w / 2 - (k * (x0 + x1)) / 2, y: h / 2 - (k * (y0 + y1)) / 2 };
      };

      /** Styling + camera for the current selection. `ms: 0` skips the flight. */
      const apply = (ms = FLY_MS) => {
        const open = features.find(isOpen) ?? null;
        
        /* If no district is open, try to read the shared camera state. 
           If there's a shared camera state, jump to it without flying. */
        if (!open) {
           const savedCamera = useRegionStore.getState().cameraState;
           if (savedCamera && ms === 0) {
              const [px, py] = proj(savedCamera.center) || [0, 0];
              const tx = w / 2 - px * savedCamera.zoom;
              const ty = h / 2 - py * savedCamera.zoom;
              d3svg.call(zb.transform, zoomIdentity.translate(tx, ty).scale(savedCamera.zoom));
           } else {
              const { k, x, y } = frame(null);
              d3svg.transition().duration(ms).ease(easeCubicInOut)
                 .call(zb.transform, zoomIdentity.translate(x, y).scale(k));
           }
        } else {
           const { k, x, y } = frame(open);
           d3svg.transition().duration(ms).ease(easeCubicInOut)
              .call(zb.transform, zoomIdentity.translate(x, y).scale(k));
        }

        paths
          .style('fill', d =>
            isOpen(d)  ? 'var(--kk-accent)'
            : known(d) ? 'color-mix(in srgb, var(--kk-accent) 24%, transparent)'
            :            'color-mix(in srgb, var(--kk-ink) 5%, transparent)')
          /* Everything but the open district recedes, so the camera move reads
             as focus rather than as the map simply getting bigger. */
          .style('fill-opacity', d => (open && !isOpen(d) ? 0.28 : isOpen(d) ? 0.5 : 1))
          .style('stroke', d => (known(d) ? 'var(--kk-accent)' : 'var(--kk-line)'))
          .style('stroke-width', d => (isOpen(d) ? 1.6 : 0.6) / scale);

        labels
          .transition().duration(ms).ease(easeCubicInOut)
          /* Counter-scale, or the camera would blow the labels up with it. */
          .attr('font-size', 8 / scale)
          .style('opacity', d => (open && !isOpen(d) ? 0 : 1));

        labels
          .style('font-weight', d => (isOpen(d) ? 600 : 400))
          .style('fill', d => (isOpen(d) ? 'var(--kk-paper)' : 'var(--kk-ink)'));
      };
      applyRef.current = () => apply();

      const draw = () => {
        w = svg.clientWidth || 640;
        h = svg.clientHeight || 420;
        proj.fitExtent([[10, 10], [w - 10, h - 10]], data);
        paths.attr('d', d => path(d) ?? '');
        labels
          .attr('x', d => path.centroid(d)[0])
          .attr('y', d => path.centroid(d)[1]);
        /* Refits must not replay the flight — the camera is already there. */
        apply(0);
      };
      draw();
      setStatus('ready');

      /* The districts arrive west to east, which reads as the map drawing
         itself rather than as a block of colour appearing. */
      const cx = (d: Feat) => path.centroid(d)[0];
      const order = [...features].sort((a, b) => cx(a) - cx(b));
      order.forEach((d, i) => {
        paths.filter(p => p === d)
          .style('opacity', 0)
          .transition().delay(i * 18).duration(420)
          .style('opacity', 1);
      });
      labels.style('opacity', 0).transition().delay(order.length * 18 + 120)
        .duration(360).style('opacity', 1);

      let timer: ReturnType<typeof setTimeout>;
      const ro = new ResizeObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(draw, 120);
      });
      ro.observe(svg);

      const onKey = (ev: KeyboardEvent) => {
        if (ev.key === 'Escape' && selectedRef.current) selectRef.current(null);
      };
      window.addEventListener('keydown', onKey);

      teardown = () => {
        clearTimeout(timer);
        ro.disconnect();
        window.removeEventListener('keydown', onKey);
      };
    })();

    return () => { dead = true; applyRef.current = null; teardown(); };
  }, [geojson, districtProperty]);

  const open = selected ? byId.current.get(selected) : null;
  const clear = useCallback(() => setSelected(null), []);

  return (
    <div className="kk-st-map">
      <div className="kk-st-map-canvas">
        <svg
          ref={svgRef}
          className="kk-st-map-svg"
          role="img"
          aria-label="Districts of the state — select one to see what it is known for"
        />

        <div ref={tipRef} className="kk-st-map-tip kk-label" aria-hidden="true" />

        {status === 'loading' && (
          <p className="kk-st-map-status kk-label">Drawing the districts…</p>
        )}
        {status === 'error' && (
          <p className="kk-st-map-status kk-label">Map unavailable</p>
        )}

        {/* The panel sits over the map rather than beside it. Rendered always
            so its entrance can transition; `data-open` drives the state. */}
        <div className="kk-st-map-panel" data-open={open ? '' : undefined} aria-live="polite">
          {open ? (
            <>
              <p className="kk-st-map-kicker kk-label">District</p>
              <h3 className="kk-st-map-name">{open.name}</h3>
              <p className="kk-st-map-note">{open.note}</p>
              {open.crafts.length > 0 && (
                <p className="kk-st-map-crafts">
                  {open.crafts.map(c => (
                    <a key={c} className="kk-st-chip" href={`#craft-${c}`}>{c}</a>
                  ))}
                </p>
              )}
              <button className="kk-st-map-clear kk-label" type="button" onClick={clear}>
                ← Back to the state
              </button>
            </>
          ) : (
            <>
              <p className="kk-st-map-kicker kk-label">The map</p>
              <p className="kk-st-map-note">
                The districts in colour have a living craft in this catalogue.
                Select one to fly to it.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
