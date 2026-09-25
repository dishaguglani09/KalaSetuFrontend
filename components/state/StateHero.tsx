import { Link } from 'react-router-dom';
import { Motif, BorderPatti } from '@/components/ornament/Motifs';
import { themeFor } from '@/lib/stateThemes';
import type { StatePage } from '@/lib/states/types';

/**
 * The opening of a state page: who this place is, in its own script and its
 * own typeface, with the two things we want the reader to do next.
 *
 * Everything here animates on load rather than on scroll — it is already in
 * view, so waiting for an observer would only delay it. The `--i` custom
 * property on each line is its rung on the stagger ladder; the ladder itself
 * lives in globals.css so the timing is tuned in one place.
 */
export default function StateHero({ page }: { page: StatePage }) {
  const theme = themeFor(page.state);
  const hasPhoto = Boolean(page.hero);
  /* Only a state with a written catalogue can promise a shop. */
  const hasShop = Boolean(page.products?.length && page.experiences?.length);

  return (
    <header className={`kk-st-hero${hasPhoto ? ' kk-st-hero--photo' : ''}`}>
      {page.hero ? (
        <div className="kk-st-hero-bg" aria-hidden="true">
          {/* Local asset, hand-sized, and the site stays free of an image
              runtime. Same decision as components/state/Frame.tsx. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.hero.src}
            alt=""
            width={page.hero.width}
            height={page.hero.height}
            /* The one image on the page worth blocking paint for. */
            loading="eager"
            fetchPriority="high"
            decoding="async"
            style={page.hero.focal ? { objectPosition: page.hero.focal } : undefined}
          />
        </div>
      ) : (
        <Motif name={theme.motif} className="kk-st-hero-mark" size={240} strokeWidth={1} />
      )}

      <div className="kk-st-hero-inner">
        <p className="kk-st-hero-back kk-label" style={{ '--i': 0 } as React.CSSProperties}>
          <Link to="/">← All of India</Link>
        </p>

        <p className="kk-st-hero-eyebrow kk-label" style={{ '--i': 1 } as React.CSSProperties}>
          {theme.art} · KalaSetu
        </p>

        <h1 className="kk-st-hero-title" style={{ '--i': 2 } as React.CSSProperties}>
          {page.title}
        </h1>

        <p className="kk-st-hero-native kk-deva" style={{ '--i': 3 } as React.CSSProperties}>
          {page.native}
        </p>

        <p className="kk-st-hero-tagline" style={{ '--i': 4 } as React.CSSProperties}>
          {page.tagline}
        </p>

        <p className="kk-st-hero-intro" style={{ '--i': 5 } as React.CSSProperties}>
          {page.intro}
        </p>

        <p className="kk-st-hero-cta" style={{ '--i': 6 } as React.CSSProperties}>
          {hasShop ? (
            <>
              <a className="kk-st-cta kk-st-cta--lead" href="#crafts">Shop the crafts</a>
              <a className="kk-st-cta" href="#experiences">Book an experience</a>
            </>
          ) : (
            <>
              {/* No catalogue here yet, so the hero points at what does
                  exist rather than at an empty section. */}
              <a className="kk-st-cta kk-st-cta--lead" href="#crafts">See the traditions</a>
              <Link className="kk-st-cta" to={`/#${encodeURIComponent(page.state)}`}>
                Find it on the map
              </Link>
            </>
          )}
        </p>

        <p
          className="kk-st-shloka kk-deva"
          title={theme.shloka.meaning}
          style={{ '--i': 7 } as React.CSSProperties}
        >
          {theme.shloka.native}
          <span className="kk-st-shloka-roman">
            {theme.shloka.roman} — {theme.shloka.meaning}
          </span>
        </p>
      </div>

      <BorderPatti className="kk-st-patti" height={14} />
    </header>
  );
}
