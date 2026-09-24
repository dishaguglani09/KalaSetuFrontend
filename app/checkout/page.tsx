'use client';

import { useCartStore } from '@/lib/store/useCartStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type CheckoutStep = 'ADDRESS' | 'PAYMENT' | 'CONFIRMATION';

export default function CheckoutPage() {
  const cartItems = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const router = useRouter();

  const [step, setStep] = useState<CheckoutStep>('ADDRESS');
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderId, setOrderId] = useState('');

  // Address state
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    flat: '',
    street: '',
    city: '',
    state: '',
    pin: '',
  });

  useEffect(() => {
    setMounted(true);
    // Auto-generate order ID just in case
    setOrderId(`KS-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`);
  }, []);

  if (!mounted) return null;

  if (cartItems.length === 0 && step !== 'CONFIRMATION') {
    return (
      <div style={{ maxWidth: '800px', margin: '120px auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--kk-ink)' }}>No items to checkout</h2>
        <button className="kk-st-buy" onClick={() => router.push('/')}>Return to Store</button>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shipping = 100;
  const total = subtotal + shipping;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('PAYMENT');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    clearCart();
    setStep('CONFIRMATION');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '120px 20px 80px' }}>
      
      {/* Steps Header */}
      {step !== 'CONFIRMATION' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '40px', fontSize: '0.9rem', color: 'var(--kk-ink-soft)' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/cart')}>Cart</span>
          <span>→</span>
          <span style={{ color: step === 'ADDRESS' ? 'var(--kk-ink)' : 'inherit', fontWeight: step === 'ADDRESS' ? 'bold' : 'normal' }}>Address</span>
          <span>→</span>
          <span style={{ color: step === 'PAYMENT' ? 'var(--kk-ink)' : 'inherit', fontWeight: step === 'PAYMENT' ? 'bold' : 'normal' }}>Payment</span>
          <span>→</span>
          <span>Confirmation</span>
        </div>
      )}

      {step === 'CONFIRMATION' ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--kk-paper)', border: '1px solid var(--kk-line)', borderRadius: '8px' }}>
          <div style={{ fontSize: '4rem', color: 'var(--accent, #b44622)', marginBottom: '20px' }}>✓</div>
          <h1 className="kk-st-name" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Order Confirmed!</h1>
          <p style={{ color: 'var(--kk-ink-soft)', marginBottom: '30px' }}>Your KalaSetu order has been placed.</p>
          
          <div style={{ display: 'inline-block', textAlign: 'left', background: 'var(--kk-paper-deep)', padding: '24px', borderRadius: '8px', marginBottom: '40px', minWidth: '300px' }}>
            <p style={{ marginBottom: '8px' }}><strong>Order ID:</strong> {orderId}</p>
            <p style={{ marginBottom: '8px' }}><strong>Delivery to:</strong> {address.city}, {address.state}</p>
            <p style={{ marginBottom: '8px' }}><strong>Total:</strong> ₹{total.toLocaleString('en-IN')}</p>
            <p style={{ color: 'var(--kk-ink-soft)', fontSize: '0.9rem', marginTop: '16px' }}>Estimated Delivery: 5–7 business days</p>
          </div>

          <div>
            <button className="kk-st-buy" onClick={() => router.push('/')}>Continue Shopping</button>
          </div>
        </div>
      ) : (
        <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px', alignItems: 'start' }}>
          
          <style>{`
            @media (max-width: 768px) {
              .checkout-layout {
                grid-template-columns: 1fr !important;
              }
            }
            .input-field {
              width: 100%;
              padding: 12px;
              background: transparent;
              border: 1px solid var(--kk-line);
              border-radius: 4px;
              color: var(--kk-ink);
              font-family: var(--font-sans);
              margin-bottom: 16px;
            }
            .input-field:focus {
              outline: none;
              border-color: var(--accent, #b44622);
            }
          `}</style>

          {/* Left Column (Forms) */}
          <div style={{ background: 'var(--kk-paper)', border: '1px solid var(--kk-line)', borderRadius: '8px', padding: '30px' }}>
            
            {step === 'ADDRESS' && (
              <form onSubmit={handleAddressSubmit}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-classic)', marginBottom: '24px', borderBottom: '1px solid var(--kk-line)', paddingBottom: '12px' }}>
                  Delivery Address
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--kk-ink-soft)' }}>Full Name</label>
                    <input required type="text" className="input-field" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--kk-ink-soft)' }}>Phone Number</label>
                    <input required type="text" className="input-field" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} />
                  </div>
                </div>

                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--kk-ink-soft)' }}>House / Flat / Building</label>
                <input required type="text" className="input-field" value={address.flat} onChange={e => setAddress({...address, flat: e.target.value})} />

                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--kk-ink-soft)' }}>Street / Area</label>
                <input required type="text" className="input-field" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--kk-ink-soft)' }}>City</label>
                    <input required type="text" className="input-field" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--kk-ink-soft)' }}>State</label>
                    <input required type="text" className="input-field" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--kk-ink-soft)' }}>PIN Code</label>
                    <input required type="text" className="input-field" value={address.pin} onChange={e => setAddress({...address, pin: e.target.value})} />
                  </div>
                </div>

                {/* Map Placeholder */}
                <div style={{ marginTop: '16px', marginBottom: '24px', padding: '16px', background: 'var(--kk-paper-deep)', borderRadius: '4px', border: '1px dashed var(--kk-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', flexDirection: 'column' }}>
                  <span style={{ fontSize: '2rem', marginBottom: '8px' }}>📍</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--kk-ink-soft)' }}>Delivery zone map placeholder</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
                  <button type="submit" className="kk-st-buy" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                    Continue to Payment
                  </button>
                </div>
              </form>
            )}

            {step === 'PAYMENT' && (
              <form onSubmit={handlePaymentSubmit}>
                <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-classic)', marginBottom: '24px', borderBottom: '1px solid var(--kk-line)', paddingBottom: '12px' }}>
                  Payment Method
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                  {['UPI', 'Credit / Debit Card', 'Net Banking', 'Cash on Delivery'].map((method) => (
                    <label key={method} style={{ display: 'flex', alignItems: 'center', padding: '16px', border: '1px solid var(--kk-line)', borderRadius: '4px', cursor: 'pointer', background: paymentMethod === method ? 'var(--kk-paper-deep)' : 'transparent' }}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value={method} 
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        style={{ marginRight: '16px', accentColor: 'var(--accent, #b44622)' }}
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'UPI' && (
                  <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--kk-paper-deep)', borderRadius: '4px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--kk-ink-soft)' }}>UPI ID</label>
                    <input required type="text" className="input-field" placeholder="example@upi" style={{ marginBottom: 0 }} />
                  </div>
                )}

                {paymentMethod === 'Credit / Debit Card' && (
                  <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--kk-paper-deep)', borderRadius: '4px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--kk-ink-soft)' }}>Card Number</label>
                    <input required type="text" className="input-field" placeholder="0000 0000 0000 0000" />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--kk-ink-soft)' }}>Expiry</label>
                        <input required type="text" className="input-field" placeholder="MM/YY" style={{ marginBottom: 0 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--kk-ink-soft)' }}>CVV</label>
                        <input required type="password" className="input-field" placeholder="123" style={{ marginBottom: 0 }} />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Cash on Delivery' && (
                  <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--kk-paper-deep)', borderRadius: '4px', fontSize: '0.9rem' }}>
                    Pay with cash when your order is delivered to your address.
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
                  <button type="button" onClick={() => setStep('ADDRESS')} style={{ background: 'transparent', border: 'none', color: 'var(--kk-ink-soft)', cursor: 'pointer', textDecoration: 'underline' }}>
                    Back to Address
                  </button>
                  <button type="submit" className="kk-st-buy" style={{ padding: '12px 24px', fontSize: '1rem' }}>
                    {paymentMethod === 'Cash on Delivery' ? 'Place Order' : `Pay ₹${total.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Right Column (Order Summary) */}
          <div style={{ padding: '24px', background: 'var(--kk-paper)', border: '1px solid var(--kk-line)', borderRadius: '8px', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-classic)', marginBottom: '20px', borderBottom: '1px solid var(--kk-line)', paddingBottom: '12px' }}>
              Order Summary
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--kk-line)', paddingBottom: '20px' }}>
              {cartItems.map((item) => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--kk-ink)' }}>{item.name} <span style={{ color: 'var(--kk-ink-soft)' }}>× {item.quantity}</span></span>
                  <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--kk-ink-soft)' }}>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--kk-ink-soft)' }}>Shipping</span>
              <span>₹{shipping.toLocaleString('en-IN')}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--kk-line)', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
