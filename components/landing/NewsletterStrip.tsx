
import { useState } from 'react';

export default function NewsletterStrip() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // POST /notifications/subscribe in production
    setStatus('sent');
    setEmail('');
  }

  return (
    <section style={{
      background: '#E8B520',
      borderTop: '2.5px solid #1A1008',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <h3 style={{
        fontFamily: "'Eczar', Georgia, serif",
        fontSize: 'clamp(1.2rem, 3vw, 1.625rem)',
        fontWeight: 700,
        color: '#1A1008',
        marginBottom: 8,
        letterSpacing: '-0.01em',
      }}>
        New artisans. New harvests. First to know.
      </h3>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: '#3A2800',
        marginBottom: 24,
      }}>
        We add products only when sourcing is confirmed. Subscribe to hear when the next batch is ready.
      </p>

      {status === 'sent' ? (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: '#1A1008' }}>
          ✓ You&apos;re on the list.
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 0, justifyContent: 'center', maxWidth: 420, margin: '0 auto' }}>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              flex: 1,
              padding: '0.7rem 1rem',
              border: '2.5px solid #1A1008',
              borderRight: 'none',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              background: '#FDF6E3',
              color: '#1A1008',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.7rem 1.5rem',
              background: '#1A1008',
              color: '#FDF6E3',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '0.04em',
              border: '2.5px solid #1A1008',
              cursor: 'pointer',
            }}
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}
