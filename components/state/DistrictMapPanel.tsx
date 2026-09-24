'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { District } from '@/lib/states/types';

/* d3 and the map component are only fetched once the section is near the
   viewport, so a reader who never scrolls this far pays nothing for them. */
const DistrictMap = dynamic(() => import('./DistrictMap'), {
  ssr: false,
  loading: () => <div className="kk-st-map-skeleton" aria-hidden="true" />,
});

export default function DistrictMapPanel(props: {
  geojson: string;
  districtProperty: string;
  districts: District[];
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || visible) return;

    /* No IntersectionObserver (or a very old browser): just load it. */
    if (typeof IntersectionObserver === 'undefined') { setVisible(true); return; }

    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '400px' },   /* start a little before it is actually seen */
    );
    io.observe(host);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={hostRef}>
      {visible
        ? <DistrictMap {...props} />
        : <div className="kk-st-map-skeleton" aria-hidden="true" />}
    </div>
  );
}
