'use client';

import Image from 'next/image';

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  category: string;
  basePrice: number;
  currency?: string;
  imageUrl: string;
  imageAlt: string;
  giStatus?: string;
  district?: string;
}

interface ProductCardProps {
  product: ProductCardData;
  onQuickAdd?: (id: string) => void;
}

export default function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  const isGI = product.giStatus?.toLowerCase().includes('gi-tagged');
  const href = `/${product.category}/${product.slug}`;

  return (
    <a
      href={href}
      style={{
        display: 'block',
        background: 'var(--bg-paper)',
        border: '1px solid var(--border)',
        textDecoration: 'none',
        color: 'var(--text-primary)',
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease, transform 0.25s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = 'var(--shadow-lg)';
        el.style.borderColor = 'var(--border-medium)';
        el.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = 'none';
        el.style.borderColor = 'var(--border)';
        el.style.transform = 'none';
      }}
    >
      {/* Image */}
      <div style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden', background: 'var(--bg-ochre)' }}>
        <Image
          src={product.imageUrl}
          alt={product.imageAlt}
          fill
          style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
        />
        {isGI && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            fontFamily: "'Open Sans', sans-serif",
            fontSize: '0.55rem', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--text-on-indigo)',
            background: 'var(--indigo)',
            padding: '3px 8px',
          }}>
            GI Tagged
          </div>
        )}
        {onQuickAdd && (
          <button
            onClick={e => { e.preventDefault(); onQuickAdd(product.id); }}
            aria-label={`Quick add ${product.name}`}
            style={{ position: 'absolute', bottom: 10, right: 10, width: 32, height: 32, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >+</button>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px 18px' }}>
        {product.district && (
          <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 5 }}>
            {product.district}
          </p>
        )}
        <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.9375rem', fontWeight: 400, lineHeight: 1.35, marginBottom: 8, color: 'var(--text-primary)' }}>
          {product.name}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <p style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--accent)' }}>
            {product.currency ?? '₹'}{product.basePrice.toFixed(0)}
          </p>
          <span style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            onwards
          </span>
        </div>
      </div>
    </a>
  );
}
