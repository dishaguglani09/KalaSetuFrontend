const SIGNALS = [
  'GI-Tagged Products',
  'Direct from Artisan',
  'Sustainably Packed',
  'Named Attribution',
];

export default function TrustSignalsBar() {
  return (
    <section style={{
      background: 'var(--bg-ochre)',
      borderTop:    '1px solid var(--border-medium)',
      borderBottom: '1px solid var(--border-medium)',
      padding: '14px var(--container-pad)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      flexWrap: 'wrap',
    }}>
      {SIGNALS.map((s, i) => (
        <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: "'Open Sans', sans-serif",
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
          }}>
            {s}
          </span>
          {i < SIGNALS.length - 1 && (
            <span style={{ color: 'var(--border-medium)', fontSize: '0.7rem' }}>·</span>
          )}
        </span>
      ))}
    </section>
  );
}
