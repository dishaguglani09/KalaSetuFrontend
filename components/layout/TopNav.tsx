
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { REGIONS, STATE_THEMES, displayName, themeFor } from '@/lib/stateThemes';
/* The slug map only — importing the registry would pull every state's
   catalogue into the bundle for a nav that renders on every page. */
import { slugForState } from '@/lib/states/slugs';
import { STATE_PAGES } from '@/lib/states';
import { useRegionStore } from '@/lib/store/useRegionStore';
import { Motif } from '@/components/ornament/Motifs';
import CraftImage from '@/components/shared/CraftImage';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const selected = useRegionStore(s => s.selected);
  const select   = useRegionStore(s => s.select);
  const cartCount = useCartStore(s => s.getCartCount());
  const wishlistCount = useWishlistStore(s => s.items.length);
  const menuRef  = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const current = selected ? themeFor(selected) : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Escape and outside clicks close the menu. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const choose = (state: string | null) => {
    select(state);
    setOpen(false);
  };
  
  const getSearchResults = () => {
    if (!searchQuery || searchQuery.length < 2) return null;
    const lower = searchQuery.toLowerCase();
    
    const stateKeys = Object.keys(STATE_THEMES);
    const matchedStates = stateKeys.filter(s => s.toLowerCase().includes(lower) || displayName(s).toLowerCase().includes(lower));
    
    const matchedCrafts: any[] = [];
    const matchedProducts: any[] = [];
    
    Object.values(STATE_PAGES).forEach(page => {
       page.crafts?.forEach(c => {
         if (c.name.toLowerCase().includes(lower)) {
           matchedCrafts.push({ ...c, pageSlug: page.slug });
         }
       });
       page.products?.forEach(p => {
         if (p.name.toLowerCase().includes(lower) || p.craft.toLowerCase().includes(lower)) {
           matchedProducts.push({ ...p, pageSlug: page.slug });
         }
       });
    });
    
    return { states: matchedStates, crafts: matchedCrafts, products: matchedProducts };
  };

  const results = getSearchResults();

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo" aria-label="KalaSetu — home" onClick={() => choose(null)}>
        <span>KalaSetu</span>
      </Link>

      <div className="hidden md:flex items-center mx-4 flex-1 max-w-[400px] relative">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (results?.states.length) {
               navigate(`/state/${slugForState(results.states[0])}`);
               setSearchQuery('');
            } else if (results?.crafts.length) {
               navigate(`/state/${results.crafts[0].pageSlug}#craft-${results.crafts[0].id}`);
               setSearchQuery('');
            } else if (results?.products.length) {
               navigate(`/state/${results.products[0].pageSlug}#${results.products[0].id}`);
               setSearchQuery('');
            }
          }}
          className="w-full"
        >
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for states, crafts, or items..." 
            className="w-full bg-transparent border-b border-[var(--kk-ink-soft)] text-[var(--kk-ink)] placeholder:text-[var(--kk-ink-soft)] px-2 py-1 outline-none text-sm font-sans focus:border-[var(--kk-accent)] transition-colors"
          />
        </form>
        
        {results && (results.states.length > 0 || results.crafts.length > 0 || results.products.length > 0) && (
          <div className="absolute top-full left-0 w-full mt-2 bg-[var(--kk-paper)] border border-[var(--kk-line)] shadow-lg z-50 rounded-md overflow-hidden flex flex-col max-h-[400px] overflow-y-auto">
             {results.states.length > 0 && (
               <div className="p-2 border-b border-[var(--kk-line)]">
                 <p className="text-xs font-semibold text-[var(--kk-ink-soft)] mb-2 px-2 uppercase tracking-wider">States</p>
                 {results.states.map(s => (
                   <button 
                     key={s} 
                     onClick={() => { navigate(`/state/${slugForState(s)}`); setSearchQuery(''); }}
                     className="w-full text-left px-2 py-1.5 hover:bg-[var(--kk-ink-soft)] hover:bg-opacity-10 rounded flex items-center gap-2"
                   >
                     <Motif name={STATE_THEMES[s].motif} size={12} strokeWidth={2} />
                     <span className="text-sm">{displayName(s)}</span>
                   </button>
                 ))}
               </div>
             )}
             
             {results.crafts.length > 0 && (
               <div className="p-2 border-b border-[var(--kk-line)]">
                 <p className="text-xs font-semibold text-[var(--kk-ink-soft)] mb-2 px-2 uppercase tracking-wider">Crafts</p>
                 {results.crafts.map(c => (
                   <button 
                     key={c.id} 
                     onClick={() => { navigate(`/state/${c.pageSlug}#craft-${c.id}`); setSearchQuery(''); }}
                     className="w-full text-left px-2 py-2 hover:bg-[var(--kk-ink-soft)] hover:bg-opacity-10 rounded flex items-center gap-3"
                   >
                     {c.image?.dynamicSearch ? (
                       <CraftImage query={c.image.dynamicSearch} alt={c.name} width={40} height={40} motif={c.motif} className="rounded object-cover" />
                     ) : (
                       <span className="w-[40px] h-[40px] bg-[var(--kk-line)] rounded flex items-center justify-center">
                         <Motif name={c.motif} size={20} strokeWidth={1} />
                       </span>
                     )}
                     <div className="flex flex-col">
                       <span className="text-sm font-medium leading-tight">{c.name}</span>
                       <span className="text-xs text-[var(--kk-ink-soft)]">{c.district}</span>
                     </div>
                   </button>
                 ))}
               </div>
             )}
             
             {results.products.length > 0 && (
               <div className="p-2">
                 <p className="text-xs font-semibold text-[var(--kk-ink-soft)] mb-2 px-2 uppercase tracking-wider">Items</p>
                 {results.products.map(p => (
                   <button 
                     key={p.id} 
                     onClick={() => { navigate(`/state/${p.pageSlug}#${p.id}`); setSearchQuery(''); }}
                     className="w-full text-left px-2 py-2 hover:bg-[var(--kk-ink-soft)] hover:bg-opacity-10 rounded flex items-center gap-3"
                   >
                     {p.image?.dynamicSearch ? (
                       <CraftImage query={p.image.dynamicSearch} alt={p.name} width={40} height={40} motif={p.motif || 'chakra'} className="rounded object-cover" />
                     ) : (
                       <span className="w-[40px] h-[40px] bg-[var(--kk-line)] rounded flex items-center justify-center">
                         <Motif name={p.motif || 'chakra'} size={20} strokeWidth={1} />
                       </span>
                     )}
                     <div className="flex flex-col">
                       <span className="text-sm font-medium leading-tight">{p.name}</span>
                       <span className="text-xs text-[var(--kk-ink-soft)]">{p.craft}</span>
                     </div>
                   </button>
                 ))}
               </div>
             )}
          </div>
        )}
      </div>

      <div className="nav-right" ref={menuRef}>
        {/* What is currently open, so the navbar always names the region */}
        {current && selected && (
          <span className="nav-current">
            <Motif name={current.motif} size={13} strokeWidth={2.2} />
            <span className="nav-current-name">{displayName(selected)}</span>
            <span className="nav-current-art">{current.art}</span>
          </span>
        )}

        <button
          className="nav-menu-btn"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-haspopup="true"
        >
          States <span aria-hidden="true" className="nav-caret" data-open={open}>▾</span>
        </button>

        {open && (
          <div className="nav-menu" role="menu" aria-label="Choose a state">
            <button className="nav-menu-all" role="menuitem" onClick={() => choose(null)}>
              ← All of India
            </button>

            <div className="nav-menu-grid">
              {REGIONS.map(region => (
                <section key={region.label} className="nav-menu-group">
                  <p className="nav-menu-label kk-label">{region.label}</p>
                  <ul className="nav-menu-list">
                    {region.states.map(state => {
                      const t = STATE_THEMES[state];
                      if (!t) return null;
                      const slug = slugForState(state);
                      /* Each row wears its own tradition's pigment. */
                      const rowStyle = { ['--row' as string]: t.colors.accent };
                      const inner = (
                        <>
                          <Motif name={t.motif} size={15} strokeWidth={2} className="nav-menu-motif" />
                          <span className="nav-menu-name">{displayName(state)}</span>
                          <span className="nav-menu-art">{t.art}</span>
                          {slug && <span className="nav-menu-go" aria-hidden="true">→</span>}
                        </>
                      );

                      return (
                        <li key={state}>
                          {slug ? (
                            /* A state with its own page is a link, not a map
                               selection — so it opens the page, and it behaves
                               like a link: middle-click, ⌘-click, prefetch. */
                            <Link
                              role="menuitem"
                              className="nav-menu-item"
                              to={`/state/${slug}`}
                              style={rowStyle}
                              onClick={() => setOpen(false)}
                            >
                              {inner}
                            </Link>
                          ) : (
                            <button
                              role="menuitem"
                              className="nav-menu-item"
                              data-active={state === selected}
                              style={rowStyle}
                              onClick={() => choose(state)}
                            >
                              {inner}
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        )}

        <Link
          to="/wishlist"
          className="nav-menu-btn"
          style={{ textDecoration: 'none', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          ❤️
          {mounted && wishlistCount > 0 && (
            <span style={{ 
              background: 'var(--kk-ink)', 
              color: 'var(--kk-paper)', 
              borderRadius: '99px', 
              padding: '0 6px', 
              fontSize: '0.75rem',
              fontWeight: 'bold',
              minWidth: '18px',
              textAlign: 'center'
            }}>
              {wishlistCount}
            </span>
          )}
        </Link>

        <Link
          to="/cart"
          className="nav-menu-btn"
          style={{ textDecoration: 'none', marginLeft: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          🛒
          {mounted && cartCount > 0 && (
            <span style={{ 
              background: 'var(--accent, #b44622)', 
              color: 'white', 
              borderRadius: '99px', 
              padding: '0 6px', 
              fontSize: '0.75rem',
              fontWeight: 'bold',
              minWidth: '18px',
              textAlign: 'center'
            }}>
              {cartCount}
            </span>
          )}
        </Link>

        <span className="nav-tagline kk-deva" aria-hidden="true" style={{ marginLeft: '1rem' }}>हस्तकला · भारत</span>
      </div>
    </nav>
  );
}
