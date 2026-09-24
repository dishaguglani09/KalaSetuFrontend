'use client';

import { useState } from 'react';
import { Motif } from '@/components/ornament/Motifs';
import type { MotifKey } from '@/lib/stateThemes';

interface CraftImageProps {
  query: string;
  alt: string;
  width: number | string;
  height: number | string;
  className?: string;
  motif: MotifKey; // Fallback motif
  style?: React.CSSProperties;
}

export default function CraftImage({ query, alt, width, height, className = '', motif, style }: CraftImageProps) {
  // Use the local wiki-image API which fetches from Wikipedia and returns 404 on failure
  const src = `/api/wiki-image?q=${encodeURIComponent(query + ' craft')}`;
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  if (error) {
    // Graceful fallback to the motif if no image is available
    return (
      <span className="kk-frame-motif" aria-hidden="true" style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--kk-paper-deep)', ...style }}>
        <Motif name={motif} size="100%" strokeWidth={1.2} />
      </span>
    );
  }

  return (
    <>
      <img
        className={`kk-frame-img ${className}`}
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        style={{ ...style, display: loading ? 'none' : 'block' }}
      />
      {loading && (
        <div 
          className={`kk-frame-img ${className}`} 
          style={{ width, height, backgroundColor: 'var(--kk-line)', animation: 'pulse-glow 2s infinite', ...style }} 
        />
      )}
    </>
  );
}
