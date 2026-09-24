import { Motif } from '@/components/ornament/Motifs';
import type { Chapter } from '@/lib/states/types';

/**
 * The state's story as numbered beats rather than four stacked paragraphs.
 *
 * Same words, a quarter of the height: on a phone this is a swipe rail with
 * scroll-snap, on desktop a four-across strip. The numeral does the work a
 * heading would otherwise do, which keeps the type hierarchy shallow.
 */
export default function CultureStrip({ chapters }: { chapters: Chapter[] }) {
  return (
    <ol className="kk-st-beats" data-reveal>
      {chapters.map((ch, i) => (
        <li key={ch.title} className="kk-st-beat">
          <p className="kk-st-beat-n kk-label">
            <span>{String(i + 1).padStart(2, '0')}</span>
            <Motif name={ch.motif} size={18} strokeWidth={1.8} />
          </p>
          <h3 className="kk-st-beat-title">{ch.title}</h3>
          <p className="kk-st-beat-body">{ch.body}</p>
        </li>
      ))}
    </ol>
  );
}
