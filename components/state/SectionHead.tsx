import { Motif } from '@/components/ornament/Motifs';
import type { MotifKey } from '@/lib/stateThemes';

/**
 * Section heading used across every state page: a motif, a label, a display
 * title and an optional standfirst. Server component — no client JS.
 */
export default function SectionHead({
  label,
  title,
  motif,
  lede,
}: {
  label: string;
  title: string;
  motif: MotifKey;
  lede?: string;
}) {
  return (
    <header className="kk-st-head" data-reveal>
      <p className="kk-st-eyebrow kk-label">
        <Motif name={motif} size={13} strokeWidth={2.2} />
        {label}
      </p>
      <h2 className="kk-st-title">{title}</h2>
      {lede && <p className="kk-st-lede">{lede}</p>}
    </header>
  );
}
