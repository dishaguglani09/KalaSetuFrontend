'use client';

import Frame from '@/components/state/Frame';
import type { Craft, Product } from '@/lib/states/types';
import { useCartStore } from '@/lib/store/useCartStore';
import { useToastStore } from '@/lib/store/useToastStore';
import WishlistButton from '@/components/ui/WishlistButton';

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/**
 * The products belonging to one craft, shown inside that craft's expansion.
 *
 * Products used to live in a separate section that the story linked down to
 * and that linked back up again. Putting them here means the story ends on
 * something buyable instead of on a scroll instruction.
 */
export default function ProductRail({
  products,
  craft,
}: {
  products: Product[];
  craft: Craft;
}) {
  const addItem = useCartStore(s => s.addItem);
  const addToast = useToastStore(s => s.addToast);
  
  if (products.length === 0) return null;

  return (
    <ul className="kk-st-grid">
      {products.map(product => (
        <li key={product.id} id={product.id} className="kk-st-card">
          <Frame
            image={product.image}
            motif={product.motif ?? craft.motif}
            ratio="1 / 1"
            className="kk-st-card-art"
          >
            {product.tag && <span className="kk-st-card-tag">{product.tag}</span>}
          </Frame>

          <div className="kk-st-card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h4 className="kk-st-card-name" style={{ paddingRight: '10px' }}>{product.name}</h4>
              <WishlistButton 
                item={{
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  artisan: craft.makers,
                  state: craft.district || 'Unknown',
                  craft: craft.name,
                  image: product.image?.src || product.image?.dynamicSearch || ''
                }} 
              />
            </div>
            <p className="kk-st-card-blurb">{product.blurb}</p>
            <p className="kk-st-card-spec">
              {product.spec}
              {product.gi && <span className="kk-st-gi">{product.gi}</span>}
            </p>

            <p className="kk-st-card-foot">
              <span className="kk-st-price">{inr(product.price)}</span>
              <button 
                className="kk-st-buy" 
                type="button" 
                onClick={() => {
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    artisan: craft.makers,
                    state: craft.district || 'Unknown',
                    image: product.image?.src || ''
                  });
                  addToast(`✓ Added ${product.name} to cart!`, 'success');
                }}
              >
                Add to bag
              </button>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
