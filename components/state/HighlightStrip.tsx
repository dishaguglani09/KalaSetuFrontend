import type { StatePage } from '@/lib/states/types';

/**
 * The scale of what is here, immediately under the hero.
 *
 * Counts are derived from the data, never written down, so they cannot drift
 * — and a state without a catalogue simply shows fewer of them rather than a
 * row of zeroes.
 */
export default function HighlightStrip({ page, art }: { page: StatePage; art: string }) {
  const crafts = page.crafts?.length ?? page.craftNames?.length ?? 0;
  const gi = page.crafts?.filter(c => c.gi).length ?? 0;

  const stats: Array<{ n: string; label: string }> = [];
  if (crafts) stats.push({ n: String(crafts), label: 'living crafts' });
  if (gi) stats.push({ n: String(gi), label: 'GI registered' });
  if (page.districts?.length) stats.push({ n: String(page.districts.length), label: 'districts' });
  if (page.experiences?.length) {
    stats.push({ n: String(page.experiences.length), label: 'experiences' });
  }
  if (page.destinations?.length) {
    stats.push({ n: String(page.destinations.length), label: 'places to visit' });
  }
  /* An overview page has only one number, which would look like an error on
     its own. The signature art form fills the row and is the more useful
     fact anyway. */
  if (stats.length < 2) stats.push({ n: art, label: 'signature tradition' });

  return (
    <div className="kk-st-stats" data-count={stats.length} data-reveal>
      {stats.map(s => (
        <div key={s.label} className="kk-st-stat">
          <span className="kk-st-stat-n">{s.n}</span>
          <span className="kk-st-stat-label kk-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
