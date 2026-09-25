
import ProductCard, { type ProductCardData } from '@/components/shared/ProductCard';

const FEATURED: ProductCardData[] = [
  {
    id: 'MITH-ART-001',
    slug: 'madhubani-bharni',
    name: 'Madhubani Painting — Bharni Style',
    category: 'art-craft',
    basePrice: 45,
    imageUrl: '/placeholder-art.jpg',
    imageAlt: 'Bharni style Madhubani painting on handmade paper',
    giStatus: 'GI-tagged (2007)',
    district: 'Madhubani',
  },
  {
    id: 'MITH-FOOD-001',
    slug: 'makhana-roasted-plain',
    name: 'Roasted Makhana — Plain',
    category: 'food-agri',
    basePrice: 12,
    imageUrl: '/placeholder-food.jpg',
    imageAlt: 'Roasted makhana fox nuts in kraft packaging',
    district: 'Darbhanga',
  },
  {
    id: 'MITH-TEX-001',
    slug: 'sikki-grass-basket',
    name: 'Sikki Grass Basket',
    category: 'art-craft',
    basePrice: 28,
    imageUrl: '/placeholder-sikki.jpg',
    imageAlt: 'Hand-woven golden Sikki grass basket',
    district: 'Madhubani',
  },
];

export default function FeaturedProductsRow() {
  return (
    <section style={{
      background: 'var(--bg-cream)',
      padding: '80px var(--container-pad)',
      borderTop: '1px solid var(--border)',
    }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <p style={{
              fontFamily: "'Open Sans', sans-serif",
              fontSize: '0.65rem', fontWeight: 600,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 12,
            }}>
              Featured
            </p>
            <h2 style={{
              fontFamily: "'Eczar', Georgia, serif",
              fontSize: 'clamp(1.6rem, 3vw, 2.25rem)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              letterSpacing: '-0.015em',
            }}>
              Picked by the Team
            </h2>
          </div>
          <a href="/art-craft" style={{
            fontFamily: "'Open Sans', sans-serif",
            fontSize: '0.8125rem', fontWeight: 600,
            letterSpacing: '0.04em',
            color: 'var(--accent)',
            textDecoration: 'none',
            borderBottom: '1.5px solid rgba(196,98,42,0.35)',
            paddingBottom: 2,
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.color='#A84A20';el.style.borderColor='rgba(168,74,32,0.6)';}}
          onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.color='var(--accent)';el.style.borderColor='rgba(196,98,42,0.35)';}}
          >
            View all →
          </a>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {FEATURED.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
