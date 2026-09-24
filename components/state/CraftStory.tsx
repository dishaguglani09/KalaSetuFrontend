import Frame from '@/components/state/Frame';
import ProductRail from '@/components/state/ProductRail';
import type { Craft, Product } from '@/lib/states/types';
import WishlistButton from '@/components/ui/WishlistButton';

/** GI mark, drawn from the active theme rather than a fixed green. */
function GiTag({ label }: { label: string }) {
  return <span className="kk-st-gi">{label}</span>;
}

/**
 * One craft: a card you open.
 *
 * Nine full essays stacked made this section 37% of the page and gave every
 * tradition the same weight. Collapsed, the nine read as a grid you can scan;
 * opened, one gives you its story *and its products together*, so the
 * narrative lands on a purchase rather than a link to another section.
 *
 * A native <details> rather than React state: exclusive accordion behaviour
 * comes free from the shared `name`, keyboard and screen-reader support are
 * native, and the whole section stays a server component — no catalogue data
 * crosses into a client bundle.
 */
export default function CraftStory({
  craft,
  products,
  districtName,
  open = false,
}: {
  craft: Craft;
  products: Product[];
  districtName: string;
  /** The first craft opens by default, so the pattern explains itself. */
  open?: boolean;
}) {
  return (
    <details className="kk-st-craft" id={`craft-${craft.id}`} name="kk-craft" open={open}>
      <summary className="kk-st-craft-head">
        <Frame
          image={craft.image}
          motif={craft.motif}
          ratio="4 / 3"
          className="kk-st-craft-art"
        />

        <div className="kk-st-craft-lead">
          <p className="kk-st-craft-where kk-label">
            {districtName}
            {craft.gi && <GiTag label={craft.gi} />}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 className="kk-st-craft-name">
              {craft.name}
              {craft.native && <span className="kk-st-craft-native kk-deva">{craft.native}</span>}
            </h3>
            <WishlistButton 
              item={{
                productId: craft.id,
                name: craft.name,
                price: 0,
                artisan: craft.makers,
                state: craft.district || districtName,
                craft: craft.name,
                image: craft.image?.src || craft.image?.dynamicSearch || ''
              }} 
            />
          </div>

          <p className="kk-st-craft-hook">{craft.hook}</p>

          <span className="kk-st-craft-more kk-label" aria-hidden="true">
            {products.length > 0
              ? `${products.length} ${products.length === 1 ? 'piece' : 'pieces'}`
              : 'Read the story'}
            <span className="kk-st-craft-chev" />
          </span>
        </div>
      </summary>

      <div className="kk-st-craft-open">
        <div className="kk-st-craft-text">
          <p className="kk-st-craft-story">{craft.story}</p>

          <dl className="kk-st-craft-meta">
            <div>
              <dt className="kk-label">How it is made</dt>
              <dd>{craft.technique}</dd>
            </div>
            <div>
              <dt className="kk-label">Who makes it</dt>
              <dd>{craft.makers}</dd>
            </div>
          </dl>
        </div>

        <ProductRail products={products} craft={craft} />
      </div>
    </details>
  );
}
