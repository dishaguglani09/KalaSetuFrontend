import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useCartStore } from '@/lib/store/useCartStore';
import { useToastStore } from '@/lib/store/useToastStore';
import CraftImage from '@/components/shared/CraftImage';
import { useNavigate } from 'react-router-dom';

export default function BuyerWishlist() {
  const items = useWishlistStore((s) => s.items);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const addItemToCart = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 20px 80px' }}>
      <h1 className="kk-st-name" style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
        My Wishlist
      </h1>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--kk-ink-soft)' }}>❤️</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--kk-ink)' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--kk-ink-soft)', marginBottom: '2rem' }}>
            Explore traditional crafts and save the ones you love.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="kk-st-buy"
            style={{ padding: '12px 24px', fontSize: '1.1rem' }}
          >
            Explore Crafts →
          </button>
        </div>
      ) : (
        <ul className="kk-st-grid">
          {items.map((item) => (
            <li key={item.productId} className="kk-st-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: 'var(--kk-paper-deep)' }}>
                {item.image ? (
                  <CraftImage 
                    query={item.image} 
                    alt={item.name} 
                    width={400}
                    height={400}
                    motif="chakra"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--kk-line)' }}>
                    ※
                  </div>
                )}
              </div>
              
              <div className="kk-st-card-body" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 className="kk-st-card-name">{item.name}</h4>
                <p className="kk-st-card-blurb" style={{ marginBottom: '1rem' }}>{item.state}</p>
                
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  {item.price > 0 && <span className="kk-st-price">₹{item.price.toLocaleString('en-IN')}</span>}
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <button 
                      onClick={() => {
                        toggleWishlist(item);
                        addToast(`Removed ${item.name} from Wishlist`);
                      }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--kk-ink-soft)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 0' }}
                    >
                      <span>♥</span> Remove
                    </button>
                    
                    {item.price > 0 && (
                      <button 
                        className="kk-st-buy"
                        onClick={() => {
                          addItemToCart({
                            productId: item.productId,
                            name: item.name,
                            price: item.price,
                            artisan: item.artisan,
                            state: item.state,
                            image: item.image
                          });
                          addToast(`✓ Added ${item.name} to cart!`, 'success');
                        }}
                      >
                        Add to bag
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
