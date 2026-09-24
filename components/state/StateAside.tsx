import Frame from '@/components/state/Frame';
import type { Destination, Experience } from '@/lib/states/types';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/**
 * Bookable experiences — the second half of the commerce, and the reason a
 * reader who will not buy a painting today might still book something.
 *
 * A horizontal rail rather than five stacked rows: each was ~190px tall for
 * forty words. Scroll-snap makes the rail feel deliberate on a phone, and the
 * overflow itself signals there is more than fits.
 */
export function ExperienceList({ experiences }: { experiences: Experience[] }) {
  return (
    <ul className="kk-st-rail" data-reveal>
      {experiences.map(e => (
        <li key={e.id} className="kk-st-exp">
          <Frame image={e.image} motif={e.motif} ratio="16 / 10" className="kk-st-exp-art" />

          <div className="kk-st-exp-body">
            <p className="kk-st-exp-meta kk-label">{e.district} · {e.duration}</p>
            <h3 className="kk-st-exp-name">{e.name}</h3>
            <p className="kk-st-exp-blurb">{e.blurb}</p>

            <p className="kk-st-exp-foot">
              <span className="kk-st-price">{inr(e.price)}</span>
              <button className="kk-st-buy" type="button" data-experience-id={e.id}>
                Book
              </button>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Tourism, deliberately compact. It supports the crafts — it is the reason to
 * make the trip once the work has earned your interest — so ten places are set
 * as a tight grid of facts rather than ten full cards.
 */
export function TourismStrip({ destinations }: { destinations: Destination[] }) {
  return (
    <ul className="kk-st-places" data-reveal>
      {destinations.map(d => (
        <li key={d.id} className="kk-st-place">
          <Frame image={d.image} motif="stupa" ratio="3 / 2" className="kk-st-place-art" />
          <p className="kk-st-place-kind kk-label">{d.kind}</p>
          <h3 className="kk-st-place-name">{d.name}</h3>
          <p className="kk-st-place-blurb">{d.blurb}</p>
          <p className="kk-st-place-where kk-label">{d.district}</p>
        </li>
      ))}
    </ul>
  );
}
