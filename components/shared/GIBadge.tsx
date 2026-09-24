interface GIBadgeProps {
  year?: string;
  size?: 'sm' | 'md';
}

export default function GIBadge({ year, size = 'md' }: GIBadgeProps) {
  const text = year ? `GI Tagged ${year}` : 'GI Tagged';
  return (
    <span
      style={{
        display: 'inline-block',
        background: '#2E7D32',
        color: '#fff',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: size === 'sm' ? '10px' : '11px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: size === 'sm' ? '2px 6px' : '3px 8px',
        border: '1.5px solid #1A1008',
      }}
    >
      {text}
    </span>
  );
}
