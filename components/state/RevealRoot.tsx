'use client';

import { useEffect } from 'react';

/**
 * Scroll reveals for the whole page, from one observer and no wrappers.
 *
 * Sections stay server components and simply carry `data-reveal`; this mounts
 * once, watches them, and sets `data-in` when they arrive. Nothing else on the
 * page needs to be a client component.
 *
 * Two deliberate safety nets, because an element that animates in is an
 * element that can fail to appear:
 *   - a <noscript> rule in globals.css reveals everything with JS disabled;
 *   - a timer reveals everything regardless after 2.5s, so a browser without
 *     IntersectionObserver, or an observer that never fires, still shows a
 *     complete page.
 */
export default function RevealRoot() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (els.length === 0) return;

    const show = (el: Element) => el.setAttribute('data-in', '');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || typeof IntersectionObserver === 'undefined') {
      els.forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          io.unobserve(entry.target);
        }
      },
      /* Trigger a little before the element edge, so the motion reads as the
         section arriving rather than as a late correction. */
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    els.forEach(el => io.observe(el));
    const failsafe = window.setTimeout(() => els.forEach(show), 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return null;
}
