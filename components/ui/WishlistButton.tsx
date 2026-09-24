'use client';

import { useWishlistStore, WishlistItem } from '@/lib/store/useWishlistStore';
import { useToastStore } from '@/lib/store/useToastStore';

interface WishlistButtonProps {
  item: Omit<WishlistItem, 'createdAt'>;
  className?: string;
  size?: number;
}

export default function WishlistButton({ item, className = '', size = 20 }: WishlistButtonProps) {
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(item.productId));
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const addToast = useToastStore((s) => s.addToast);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(item);
    if (isWishlisted) {
      addToast(`Removed ${item.name} from Wishlist`);
    } else {
      addToast(`♥ Added ${item.name} to Wishlist`, 'success');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`wishlist-btn ${className}`}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: `${size}px`,
        color: isWishlisted ? 'var(--accent, #b44622)' : 'var(--kk-ink-soft, rgba(0,0,0,0.5))',
        transition: 'all 0.2s ease',
        lineHeight: 1,
        padding: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      {isWishlisted ? '♥' : '♡'}
    </button>
  );
}
