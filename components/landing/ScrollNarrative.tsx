'use client';

import { useRef, useEffect } from 'react';

const CHAPTERS = [
  {
    word: 'Bihar',
    script: 'बिहार',
    detail: 'Eastern India',
    sub: 'The Gangetic heartland — ancient cradle of civilisation',
    rgb: [238, 229, 208],
  },
  {
    word: 'Mithilanchal',
    script: 'मिथिलांचल',
    detail: 'Northern Bihar',
    sub: 'Kingdom of Janaka — where art is woven into daily ritual',
    rgb: [229, 218, 193],
  },
  {
    word: 'Madhubani',
    script: 'मधुबनी',
    detail: 'GI-Tagged · 2007',
    sub: 'Five centuries unbroken — every wall tells a story',
    rgb: [220, 207, 180],
  },
];

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function prog(v: number, start: number, end: number) { return clamp((v - start) / (end - start), 0, 1); }

export default function ScrollNarrative() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef      = useRef<HTMLDivElement>(null);
  const chRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const barRef     = useRef<HTMLDivElement>(null);
  const dotRefs    = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handle = () => {
      const section = sectionRef.current;
      if (!section) return;

      const scrollable = section.offsetHeight - window.innerHeight;
      const scrolled   = -section.getBoundingClientRect().top;
      const p          = clamp(scrolled / scrollable, 0, 1);

      // ── Chapter visibility ──────────────────────────────────
      // Ch0: visible from start, fade out 0.26→0.40
      const ch0op = p < 0.26 ? 1 : 1 - prog(p, 0.26, 0.40);
      const ch0y  = p < 0.26 ? 0 : lerp(0, -22, prog(p, 0.26, 0.40));

      // Ch1: fade in 0.33→0.47, hold 0.47→0.65, fade out 0.65→0.78
      const ch1op = p < 0.33 ? 0
                  : p < 0.47 ? prog(p, 0.33, 0.47)
                  : p < 0.65 ? 1
                  : 1 - prog(p, 0.65, 0.78);
      const ch1y  = p < 0.33 ? 28
                  : p < 0.47 ? lerp(28, 0, prog(p, 0.33, 0.47))
                  : p < 0.65 ? 0
                  : lerp(0, -22, prog(p, 0.65, 0.78));

      // Ch2: fade in 0.72→0.85, hold 0.85→1.0
      const ch2op = p < 0.72 ? 0 : prog(p, 0.72, 0.85);
      const ch2y  = p < 0.72 ? 28 : lerp(28, 0, prog(p, 0.72, 0.85));

      const states = [
        { op: ch0op, y: ch0y },
        { op: ch1op, y: ch1y },
        { op: ch2op, y: ch2y },
      ];

      chRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.opacity   = String(states[i].op);
        el.style.transform = `translateY(${states[i].y}px)`;
      });

      // ── Background interpolation ────────────────────────────
      if (bgRef.current) {
        let r, g, b;
        if (p < 0.40) {
          const t = prog(p, 0, 0.40);
          r = lerp(CHAPTERS[0].rgb[0], CHAPTERS[1].rgb[0], t);
          g = lerp(CHAPTERS[0].rgb[1], CHAPTERS[1].rgb[1], t);
          b = lerp(CHAPTERS[0].rgb[2], CHAPTERS[1].rgb[2], t);
        } else {
          const t = prog(p, 0.40, 1.0);
          r = lerp(CHAPTERS[1].rgb[0], CHAPTERS[2].rgb[0], t);
          g = lerp(CHAPTERS[1].rgb[1], CHAPTERS[2].rgb[1], t);
          b = lerp(CHAPTERS[1].rgb[2], CHAPTERS[2].rgb[2], t);
        }
        bgRef.current.style.background = `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
      }

      // ── Progress bar ────────────────────────────────────────
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;

      // ── Active dot ──────────────────────────────────────────
      const active = p < 0.38 ? 0 : p < 0.72 ? 1 : 2;
      dotRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.background = i === active
          ? 'rgba(44,26,14,0.62)'
          : 'rgba(44,26,14,0.18)';
        el.style.transform = i === active ? 'scale(1.4)' : 'scale(1)';
      });
    };

    window.addEventListener('scroll', handle, { passive: true });
    handle();
    return () => window.removeEventListener('scroll', handle);
  }, []);

  return (
    <section ref={sectionRef} style={{ height: '300vh', position: 'relative' }}>
      {/* Sticky viewport */}
      <div
        ref={bgRef}
        style={{
          position: 'sticky', top: 0,
          height: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          background: `rgb(${CHAPTERS[0].rgb.join(',')})`,
        }}
      >
        {/* Subtle grain overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`,
          opacity: 0.6,
        }} />

        {/* Chapters */}
        {CHAPTERS.map((ch, i) => (
          <div
            key={ch.word}
            ref={el => { chRefs.current[i] = el; }}
            style={{
              position: 'absolute',
              textAlign: 'center',
              padding: '0 clamp(1.5rem, 6vw, 5rem)',
              opacity: i === 0 ? 1 : 0,
              transform: i === 0 ? 'none' : 'translateY(28px)',
              willChange: 'opacity, transform',
              maxWidth: 820,
              width: '100%',
            }}
          >
            {/* District / detail label */}
            <p style={{
              fontFamily: "'Open Sans', sans-serif",
              fontSize: '0.6rem', fontWeight: 600,
              letterSpacing: '0.26em', textTransform: 'uppercase',
              color: 'rgba(44,26,14,0.38)',
              marginBottom: 28,
            }}>
              {ch.detail}
            </p>

            {/* Main word */}
            <h2 style={{
              fontFamily: "'Eczar', Georgia, serif",
              fontSize: 'clamp(3.5rem, 11vw, 8.5rem)',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: '#2C1A0E',
              marginBottom: 0,
            }}>
              {ch.word}
            </h2>

            {/* Devanagari */}
            <p style={{
              fontFamily: "'Eczar', Georgia, serif",
              fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
              fontWeight: 400,
              color: 'rgba(44,26,14,0.28)',
              letterSpacing: '0.02em',
              marginTop: 10, marginBottom: 28,
            }}>
              {ch.script}
            </p>

            {/* Divider line */}
            <div style={{
              width: 40, height: 1,
              background: 'rgba(44,26,14,0.22)',
              margin: '0 auto 24px',
            }} />

            {/* Sub text */}
            <p style={{
              fontFamily: "'Open Sans', sans-serif",
              fontSize: 'clamp(0.8rem, 1.5vw, 0.9375rem)',
              fontWeight: 300,
              color: 'rgba(44,26,14,0.48)',
              letterSpacing: '0.025em',
              lineHeight: 1.7,
            }}>
              {ch.sub}
            </p>
          </div>
        ))}

        {/* Chapter dots */}
        <div style={{
          position: 'absolute', bottom: 44, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          {CHAPTERS.map((ch, i) => (
            <div
              key={ch.word}
              ref={el => { dotRefs.current[i] = el; }}
              style={{
                width: 5, height: 5, borderRadius: '50%',
                background: i === 0 ? 'rgba(44,26,14,0.62)' : 'rgba(44,26,14,0.18)',
                transform: i === 0 ? 'scale(1.4)' : 'scale(1)',
                transition: 'background 0.4s ease, transform 0.4s ease',
              }}
            />
          ))}
        </div>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: 36, right: 'clamp(1.5rem, 5vw, 4rem)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.55rem', letterSpacing: '0.12em',
            color: 'rgba(44,26,14,0.32)',
            textTransform: 'uppercase',
          }}>
            Scroll
          </span>
          <div style={{
            width: 1, height: 22,
            background: 'rgba(44,26,14,0.22)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(44,26,14,0.5)',
              animation: 'scrollDrop 1.6s ease-in-out infinite',
            }} />
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 1.5,
          background: 'rgba(44,26,14,0.07)',
        }}>
          <div
            ref={barRef}
            style={{
              height: '100%',
              background: 'rgba(155,76,30,0.5)',
              transformOrigin: 'left',
              transform: 'scaleX(0)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
