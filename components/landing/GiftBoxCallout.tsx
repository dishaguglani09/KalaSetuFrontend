export default function GiftBoxCallout() {
  return (
    <section style={{
      background: '#1A1008',
      color: '#FDF6E3',
      padding: '72px 24px',
      textAlign: 'center',
    }}>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#E8B520',
        marginBottom: 16,
      }}>
        Flagship Bundle
      </p>

      <h2 style={{
        fontFamily: "'Eczar', 'Playfair Display', Georgia, serif",
        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        marginBottom: 20,
        maxWidth: 680,
        margin: '0 auto 20px',
      }}>
        The Mithila Culture Gift Box
      </h2>

      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 'clamp(0.9375rem, 1.8vw, 1.0625rem)',
        lineHeight: 1.6,
        color: '#F5E6C8',
        maxWidth: 560,
        margin: '0 auto 36px',
      }}>
        A Madhubani print, a hand-woven Sikki basket, and roasted Makhana —
        curated into one box. The same art and produce gifted to world leaders in 2026.
        No equivalent exists on any other platform.
      </p>

      <a
        href="/art-craft/mithila-culture-gift-box"
        style={{
          display: 'inline-block',
          background: '#D4622A',
          color: '#FDF6E3',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: '0.9375rem',
          letterSpacing: '0.04em',
          padding: '0.8rem 2.25rem',
          border: '2.5px solid #FDF6E3',
          textDecoration: 'none',
        }}
      >
        See the Gift Box
      </a>
    </section>
  );
}
