'use client';

const CATEGORIES = [
  {
    key: 'art-craft',
    label: 'Art & Visual Craft',
    sub: 'Madhubani · Sikki · Sujani embroidery',
    accent: '#C4622A',
    bgHover: '#FFF0E6',
  },
  {
    key: 'food-agri',
    label: 'Food & Agri',
    sub: 'Makhana · Litchi · Katarni Rice',
    accent: '#1A7A6A',
    bgHover: '#E8F5F2',
  },
];

export default function CategoryTileGrid() {
  return (
    <section style={{
      background: 'var(--bg-paper)',
      padding: '80px var(--container-pad)',
    }}>
      {/* Section label */}
      <p style={{
        fontFamily: "'Open Sans', sans-serif",
        fontSize: '0.65rem', fontWeight: 600,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--accent)',
        marginBottom: 14,
      }}>
        Browse
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20,
        maxWidth: 920,
      }}>
        {CATEGORIES.map(cat => (
          <a
            key={cat.key}
            href={`/${cat.key}`}
            style={{
              display: 'block',
              padding: '52px 44px',
              background: 'var(--bg-cream)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              transition: 'background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = cat.bgHover;
              el.style.borderColor = cat.accent + '60';
              el.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--bg-cream)';
              el.style.borderColor = 'var(--border)';
              el.style.boxShadow = 'none';
            }}
          >
            <div style={{ width: 32, height: 2.5, background: cat.accent, marginBottom: 26 }} />
            <h3 style={{
              fontFamily: "'Eczar', Georgia, serif",
              fontSize: 'clamp(1.5rem, 2.5vw, 1.875rem)',
              fontWeight: 600,
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
              marginBottom: 12,
            }}>
              {cat.label}
            </h3>
            <p style={{
              fontFamily: "'Open Sans', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 400,
              color: 'var(--text-secondary)',
              letterSpacing: '0.01em',
              lineHeight: 1.65,
              marginBottom: 32,
            }}>
              {cat.sub}
            </p>
            <span style={{
              fontFamily: "'Open Sans', sans-serif",
              fontSize: '0.75rem', fontWeight: 600,
              letterSpacing: '0.06em',
              color: cat.accent,
              display: 'inline-flex', alignItems: 'center', gap: 5,
              borderBottom: `1.5px solid ${cat.accent}55`,
              paddingBottom: 2,
            }}>
              Shop Now →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
