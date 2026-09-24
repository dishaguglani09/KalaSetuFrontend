'use client';

import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useToastStore } from '@/lib/store/useToastStore';
import CraftImage from '@/components/shared/CraftImage';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const cartItems = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const addToast = useToastStore((s) => s.addToast);
  
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const shipping = cartItems.length > 0 ? 100 : 0;
  const total = subtotal + shipping;

  const handleMoveToWishlist = (item: any) => {
    toggleWishlist({
      productId: item.productId,
      name: item.name,
      price: item.price,
      artisan: item.artisan,
      state: item.state,
      craft: 'Craft', // Placeholder if not in cart item
      image: item.image,
    });
    removeItem(item.productId);
    addToast(`Moved ${item.name} to Wishlist ♥`);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '120px 20px 80px' }}>
      <h1 className="kk-st-name" style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
        Your Cart
      </h1>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--kk-ink-soft)' }}>🛒</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--kk-ink)' }}>Your Cart is Empty</h2>
          <button 
            onClick={() => router.push('/')}
            className="kk-st-buy"
            style={{ padding: '12px 24px', fontSize: '1.1rem' }}
          >
            Continue Shopping →
          </button>
        </div>
      ) : (
        <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '40px', alignItems: 'start' }}>
          
          <style>{`
            @media (max-width: 768px) {
              .cart-layout {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cartItems.map((item) => (
              <div key={item.productId} style={{ 
                display: 'flex', gap: '20px', padding: '20px', 
                background: 'var(--kk-paper)', border: '1px solid var(--kk-line)', borderRadius: '8px',
                flexWrap: 'wrap'
              }}>
                <div style={{ width: '120px', height: '120px', background: 'var(--kk-paper-deep)', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                  {item.image ? (
                    <CraftImage query={item.image} alt={item.name} width={120} height={120} motif="chakra" className="w-full h-full object-cover" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>※</div>
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-classic)', marginBottom: '4px' }}>{item.name}</h3>
                  <p style={{ color: 'var(--kk-ink-soft)', fontSize: '0.9rem', marginBottom: '12px' }}>{item.state}</p>
                  <p className="kk-st-price" style={{ marginBottom: '16px' }}>₹{item.price.toLocaleString('en-IN')}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: 'auto', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--kk-line)', borderRadius: '4px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{ padding: '4px 12px', background: 'transparent', border: 'none', cursor: 'pointer', borderRight: '1px solid var(--kk-line)' }}
                      >−</button>
                      <span style={{ padding: '4px 16px', fontSize: '0.9rem' }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        style={{ padding: '4px 12px', background: 'transparent', border: 'none', cursor: 'pointer', borderLeft: '1px solid var(--kk-line)' }}
                      >+</button>
                    </div>

                    <button 
                      onClick={() => handleMoveToWishlist(item)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--kk-ink-soft)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>♥</span> Move to Wishlist
                    </button>

                    <button 
                      onClick={() => {
                        removeItem(item.productId);
                        addToast(`Removed ${item.name} from Cart`);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--kk-ink-soft)', cursor: 'pointer', fontSize: '0.9rem', marginLeft: 'auto' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            padding: '24px', background: 'var(--kk-paper)', 
            border: '1px solid var(--kk-line)', borderRadius: '8px',
            position: 'sticky', top: '100px'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-classic)', marginBottom: '20px', borderBottom: '1px solid var(--kk-line)', paddingBottom: '12px' }}>
              Order Summary
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.9rem' }}>
              <span>Shipping</span>
              <span>₹{shipping.toLocaleString('en-IN')}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--kk-line)', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>

            <button 
              className="kk-st-buy"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', display: 'block', textAlign: 'center' }}
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
