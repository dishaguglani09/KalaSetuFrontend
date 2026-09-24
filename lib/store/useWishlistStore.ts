import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  artisan: string;
  state: string;
  craft: string;
  image: string;
  createdAt: number;
}

interface WishlistStore {
  items: WishlistItem[];
  toggleWishlist: (item: Omit<WishlistItem, 'createdAt'>) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (item) => {
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          if (exists) {
            return {
              items: state.items.filter((i) => i.productId !== item.productId),
            };
          }
          return {
            items: [...state.items, { ...item, createdAt: Date.now() }],
          };
        });
      },
      isWishlisted: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },
    }),
    {
      name: 'kalasetu-wishlist',
    }
  )
);
