/**
 * Traditional Indian motifs, drawn as line art in a 100×100 field.
 *
 * Every motif strokes in `currentColor` so it inherits whichever state theme is
 * active. They are deliberately drawn in a single visual weight — Madhubani's
 * kajal outline — so that mixing motifs from different regions still reads as
 * one hand.
 */

import type { MotifKey } from '@/lib/stateThemes';

interface MotifProps {
  size?: number | string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

type Svg = React.SVGProps<SVGSVGElement>;

function Frame({ size = 100, strokeWidth = 1.4, className, style, children, ...rest }: MotifProps & Svg & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ── Sudarshana Chakra — the discus of Shri Krishna ────────────────────── */
export function Chakra(p: MotifProps & Svg) {
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    return (
      <line key={i}
        x1={50 + Math.cos(a) * 14} y1={50 + Math.sin(a) * 14}
        x2={50 + Math.cos(a) * 33} y2={50 + Math.sin(a) * 33} />
    );
  });
  // Serrated outer rim — the chakra's flame-edged blade.
  const teeth = Array.from({ length: 16 }, (_, i) => {
    const a0 = (i / 16) * Math.PI * 2;
    const a1 = ((i + 0.5) / 16) * Math.PI * 2;
    const a2 = ((i + 1) / 16) * Math.PI * 2;
    return `${i === 0 ? 'M' : 'L'}${50 + Math.cos(a0) * 38} ${50 + Math.sin(a0) * 38}
            L${50 + Math.cos(a1) * 47} ${50 + Math.sin(a1) * 47}
            L${50 + Math.cos(a2) * 38} ${50 + Math.sin(a2) * 38}`;
  }).join(' ') + ' Z';
  return (
    <Frame {...p}>
      <path d={teeth} />
      <circle cx="50" cy="50" r="38" />
      <circle cx="50" cy="50" r="33" />
      <circle cx="50" cy="50" r="14" />
      <circle cx="50" cy="50" r="6" />
      {spokes}
    </Frame>
  );
}

/* ── Trishul — the trident of Shiva ────────────────────────────────────── */
export function Trishul(p: MotifProps & Svg) {
  return (
    <Frame {...p}>
      <line x1="50" y1="30" x2="50" y2="92" />
      <path d="M50 32 V8" />
      <path d="M31 34 V16 Q31 9 35 6" />
      <path d="M69 34 V16 Q69 9 65 6" />
      <path d="M31 34 Q31 44 50 44 Q69 44 69 34" />
      <path d="M28 34 H72" />
      {/* damaru knot at the shaft */}
      <path d="M43 52 Q50 58 57 52 M43 60 Q50 54 57 60" />
      <circle cx="50" cy="14" r="2.4" />
    </Frame>
  );
}

/* ── Mithila double fish — fertility and good fortune in Madhubani ─────── */
export function Fish(p: MotifProps & Svg) {
  const one = (cy: number, flip: number) => (
    <g transform={`translate(0 ${cy}) scale(1 ${flip})`}>
      <path d="M18 0 Q38 -14 60 0 Q38 14 18 0 Z" />
      <path d="M60 0 L78 -11 L74 0 L78 11 Z" />
      <circle cx="28" cy="-2" r="1.8" />
      <path d="M36 -8 Q40 0 36 8 M44 -9 Q48 0 44 9 M52 -7 Q56 0 52 7" />
    </g>
  );
  return (
    <Frame {...p}>
      {one(32, 1)}
      {one(68, -1)}
    </Frame>
  );
}

/* ── Lotus — kamal, the seat of the divine ─────────────────────────────── */
export function Lotus(p: MotifProps & Svg) {
  const petals = Array.from({ length: 8 }, (_, i) => (
    <ellipse key={i} cx="50" cy="34" rx="8" ry="18"
      transform={`rotate(${i * 45} 50 50)`} />
  ));
  return (
    <Frame {...p}>
      {petals}
      <circle cx="50" cy="50" r="9" />
      <circle cx="50" cy="50" r="3.5" />
    </Frame>
  );
}

/* ── Paisley — ambi / buta, the mango form of Kashmir and Mughal work ──── */
export function Paisley(p: MotifProps & Svg) {
  return (
    <Frame {...p}>
      <path d="M50 88 Q14 66 26 38 Q36 14 56 16 Q78 18 78 42 Q78 62 58 60 Q42 58 44 44 Q46 34 56 36" />
      <path d="M50 78 Q26 62 34 42 Q42 24 56 25 Q70 27 70 43 Q70 54 60 53" />
      <circle cx="55" cy="44" r="3" />
      <path d="M40 70 q6 4 12 4 M36 60 q6 4 12 3" />
    </Frame>
  );
}

/* ── Kalash — the auspicious pot with coconut and mango leaves ─────────── */
export function Kalash(p: MotifProps & Svg) {
  return (
    <Frame {...p}>
      <path d="M32 52 Q22 70 34 86 H66 Q78 70 68 52 Z" />
      <path d="M28 48 H72 L68 54 H32 Z" />
      <path d="M38 48 q6 -12 -4 -18 M62 48 q-6 -12 4 -18 M50 46 q-10 -14 0 -22 q10 8 0 22" />
      <circle cx="50" cy="18" r="8" />
      <path d="M34 66 h32 M38 76 h24" />
    </Frame>
  );
}

/* ── Surya — the sun, ubiquitous in Aipan and tribal wall art ──────────── */
export function Sun(p: MotifProps & Svg) {
  const rays = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const r0 = 26, r1 = i % 2 ? 38 : 45;
    return <line key={i}
      x1={50 + Math.cos(a) * r0} y1={50 + Math.sin(a) * r0}
      x2={50 + Math.cos(a) * r1} y2={50 + Math.sin(a) * r1} />;
  });
  return (
    <Frame {...p}>
      {rays}
      <circle cx="50" cy="50" r="22" />
      <circle cx="50" cy="50" r="16" />
      <circle cx="43" cy="46" r="1.8" />
      <circle cx="57" cy="46" r="1.8" />
      <path d="M42 56 q8 7 16 0" />
    </Frame>
  );
}

/* ── Peacock — mayura, the vehicle of Kartikeya and Gond/Kalamkari staple ─ */
export function Peacock(p: MotifProps & Svg) {
  const feathers = Array.from({ length: 7 }, (_, i) => {
    const a = (-80 + i * 26) * (Math.PI / 180);
    const x = 52 + Math.cos(a) * 34, y = 58 + Math.sin(a) * 34;
    return (
      <g key={i}>
        <line x1="52" y1="58" x2={x} y2={y} />
        <circle cx={x} cy={y} r="4.5" />
        <circle cx={x} cy={y} r="1.6" />
      </g>
    );
  });
  return (
    <Frame {...p}>
      {feathers}
      <path d="M52 58 Q44 48 44 38 Q44 26 52 24 Q60 26 58 34 Q56 42 52 44" />
      <circle cx="50" cy="24" r="5" />
      <path d="M50 19 l1 -7 l3 4" />
      <path d="M45 24 l-7 3 l7 3" />
      <path d="M46 62 q6 8 14 4" />
    </Frame>
  );
}

/* ── Kolam — the dot lattice drawn at Tamil thresholds each dawn ───────── */
export function Kolam(p: MotifProps & Svg) {
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      dots.push(<circle key={`${r}-${c}`} cx={22 + c * 14} cy={22 + r * 14} r="1.4" fill="currentColor" stroke="none" />);
    }
  }
  const loops = Array.from({ length: 4 }, (_, i) => (
    <path key={i}
      d="M50 22 Q64 22 64 36 Q64 50 50 50 Q36 50 36 36 Q36 22 50 22 Z"
      transform={`rotate(${i * 90} 50 50)`} />
  ));
  return (
    <Frame {...p}>
      {dots}
      {loops}
      <circle cx="50" cy="50" r="6" />
    </Frame>
  );
}

/* ── Elephant — gaja, of Bidri inlay and Bastar bronze ─────────────────── */
export function Elephant(p: MotifProps & Svg) {
  return (
    <Frame {...p}>
      <path d="M22 74 V54 Q22 36 42 34 H62 Q80 34 80 52 V74" />
      <path d="M30 74 V60 M46 74 V58 M62 74 V58 M74 74 V60" />
      <path d="M28 40 Q16 44 18 56 Q19 66 26 66" />
      <path d="M22 44 q-8 6 -4 16 q3 8 10 6" />
      <circle cx="32" cy="44" r="1.8" />
      <path d="M40 26 q10 -8 22 -2 l-4 10" />
      <path d="M46 34 q6 -6 12 -4" />
    </Frame>
  );
}

/* ── Shankha — the conch, sounded before ritual ────────────────────────── */
export function Conch(p: MotifProps & Svg) {
  return (
    <Frame {...p}>
      <path d="M62 18 Q80 34 74 58 Q68 82 44 86 Q26 88 22 74 Q19 62 32 60 Q44 58 44 48 Q44 36 56 34" />
      <path d="M62 18 Q52 26 50 38" />
      <path d="M66 34 q-8 4 -10 14 M70 48 q-10 4 -12 14 M68 62 q-10 4 -14 12" />
      <path d="M30 72 q8 -6 14 -2" />
    </Frame>
  );
}

/* ── Bamboo — the cane of the northeast ────────────────────────────────── */
export function Bamboo(p: MotifProps & Svg) {
  return (
    <Frame {...p}>
      <path d="M38 92 V16 M62 92 V26" />
      <path d="M32 74 h12 M32 56 h12 M32 38 h12 M56 78 h12 M56 60 h12 M56 42 h12" />
      <path d="M38 40 Q22 34 18 20 Q34 20 38 34" />
      <path d="M62 50 Q78 44 82 30 Q66 30 62 44" />
      <path d="M38 22 Q46 14 58 14" />
    </Frame>
  );
}

/* ── Wave — the sea, for the island and coastal traditions ─────────────── */
export function Wave(p: MotifProps & Svg) {
  const rows = Array.from({ length: 5 }, (_, i) => (
    <path key={i} d={`M8 ${28 + i * 12} q11 -9 22 0 t22 0 t22 0 t22 0`} />
  ));
  return <Frame {...p}>{rows}</Frame>;
}

/* ── Warli figure — the triangle-bodied dancer of the Western Ghats ────── */
export function Triangle(p: MotifProps & Svg) {
  return (
    <Frame {...p}>
      <circle cx="50" cy="20" r="8" />
      <path d="M50 28 L36 50 H64 Z" />
      <path d="M50 50 L36 72 H64 Z" />
      <path d="M40 38 L20 28 M60 38 L80 28" />
      <path d="M44 72 L34 92 M56 72 L66 92" />
      <path d="M20 28 l-6 -6 M80 28 l6 -6" />
    </Frame>
  );
}

/* ── Stupa — the Buddhist reliquary of Sikkim and the high Himalaya ────── */
export function Stupa(p: MotifProps & Svg) {
  return (
    <Frame {...p}>
      <path d="M26 90 H74 M30 90 V80 H70 V90" />
      <path d="M34 80 V70 H66 V80" />
      <path d="M30 70 Q30 44 50 44 Q70 44 70 70" />
      <path d="M42 44 V36 H58 V44" />
      <path d="M44 36 L50 12 L56 36" />
      <circle cx="50" cy="9" r="4" />
      <path d="M38 60 h24" />
    </Frame>
  );
}

/* ── Bankura horse — the terracotta horse of Bengal ────────────────────── */
export function Horse(p: MotifProps & Svg) {
  return (
    <Frame {...p}>
      <path d="M26 84 V56 Q26 46 40 46 H62 Q74 46 74 58 V84" />
      <path d="M34 84 V64 M66 84 V64" />
      <path d="M62 46 V32 Q62 22 72 20 L84 16" />
      <path d="M72 20 L70 8 L78 16 L88 8 L84 18" />
      <circle cx="76" cy="22" r="1.6" />
      <path d="M26 56 L14 40 M26 60 L12 52" />
      <path d="M34 46 q14 8 28 0" />
    </Frame>
  );
}

/* ── Ikat diamond — the resist-dyed lattice of Pochampally and Patola ──── */
export function Diamond(p: MotifProps & Svg) {
  return (
    <Frame {...p}>
      <path d="M50 8 L88 50 L50 92 L12 50 Z" />
      <path d="M50 22 L74 50 L50 78 L26 50 Z" />
      <path d="M50 36 L62 50 L50 64 L38 50 Z" />
      <path d="M50 44 L56 50 L50 56 L44 50 Z" fill="currentColor" stroke="none" />
      <path d="M50 8 L50 0 M88 50 L96 50 M50 92 L50 100 M12 50 L4 50" />
    </Frame>
  );
}

/* ── Shell — the scallop of the Andaman and Lakshadweep coasts ─────────── */
export function Shell(p: MotifProps & Svg) {
  const ribs = Array.from({ length: 7 }, (_, i) => {
    const a = (-150 + i * 20) * (Math.PI / 180);
    return <line key={i} x1="50" y1="82" x2={50 + Math.cos(a) * 44} y2={82 + Math.sin(a) * 44} />;
  });
  return (
    <Frame {...p}>
      <path d="M50 82 Q6 82 14 46 Q24 12 50 12 Q76 12 86 46 Q94 82 50 82 Z" />
      {ribs}
      <path d="M40 82 q10 8 20 0" />
    </Frame>
  );
}

const MOTIFS: Record<MotifKey, (p: MotifProps & Svg) => JSX.Element> = {
  fish: Fish, chakra: Chakra, trishul: Trishul, lotus: Lotus, peacock: Peacock,
  kolam: Kolam, paisley: Paisley, kalash: Kalash, sun: Sun, elephant: Elephant,
  conch: Conch, bamboo: Bamboo, wave: Wave, triangle: Triangle, stupa: Stupa,
  horse: Horse, diamond: Diamond, shell: Shell,
};

/** Render a motif by key. */
export function Motif({ name, ...rest }: { name: MotifKey } & MotifProps & Svg) {
  const Cmp = MOTIFS[name] ?? Lotus;
  return <Cmp {...rest} />;
}

/**
 * Repeating hairline border — the patti that frames a Madhubani panel.
 * Renders as a horizontal strip of alternating lotus buds and diamonds.
 */
export function BorderPatti({ height = 14, className, style }: { height?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      height={height}
      width="100%"
      viewBox="0 0 120 14"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.7"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="kk-patti" x="0" y="0" width="20" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 7 H20" strokeOpacity="0.45" />
          <path d="M10 1.5 L14 7 L10 12.5 L6 7 Z" />
          <path d="M0 7 Q2.5 3 5 7 Q2.5 11 0 7" strokeOpacity="0.7" />
          <path d="M15 7 Q17.5 3 20 7 Q17.5 11 15 7" strokeOpacity="0.7" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="120" height="14" fill="url(#kk-patti)" stroke="none" />
    </svg>
  );
}
