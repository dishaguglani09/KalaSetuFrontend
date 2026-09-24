import { Motif } from '@/components/ornament/Motifs';
import type { MotifKey } from '@/lib/stateThemes';

/**
 * The crafts of a state that has not been written up yet.
 *
 * Names and the region's motif, and nothing more — the honest amount for
 * data we actually hold. It is deliberately not a collapsed CraftStory: an
 * accordion that opens onto nothing would promise depth this state does not
 * have yet.
 */
/**
 * Which craft is the state's signature.
 *
 * The registry names the art form loosely against the craft list — "Madhubani"
 * against "Madhubani painting", "Kasavu" against "Kasavu sarees" — so an exact
 * comparison matched in only 5 of 36 states. Matching on the art form's first
 * word finds it in nearly all of them, and simply marks nothing when it
 * genuinely does not correspond.
 */
function signatureIndex(crafts: string[], art: string): number {
  const key = art.toLowerCase().replace(/[^a-z ]/g, ' ').trim().split(' ')[0];
  if (!key) return -1;
  return crafts.findIndex(c => c.toLowerCase().includes(key));
}

export default function CraftBrief({
  crafts,
  motif,
  art,
}: {
  crafts: string[];
  motif: MotifKey;
  art: string;
}) {
  const signature = signatureIndex(crafts, art);

  return (
    <ul className="kk-st-briefs" data-reveal>
      {crafts.map((name, i) => (
        <li key={name} className="kk-st-brief">
          <span className="kk-st-brief-mark" aria-hidden="true">
            <Motif name={motif} size={26} strokeWidth={1.5} />
          </span>
          <h3 className="kk-st-brief-name">{name}</h3>
          {i === signature && <span className="kk-st-brief-tag kk-label">Signature</span>}
        </li>
      ))}
    </ul>
  );
}
