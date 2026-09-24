import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  artisan: string;
  state: string;
  image: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getSubtotal: () => number;
}

const CART_KEY = 'kalasetu_cart';

const getInitialCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const savedCart = localStorage.getItem(CART_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Failed to parse cart from localStorage:', error);
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }
};

export const useCartStore = create<CartStore>()((set, get) => ({
  items: getInitialCart(),
  addItem: (newItem) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === newItem.productId);
      const newItems = existing
        ? state.items.map((i) =>
            i.productId === newItem.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...state.items, { ...newItem, quantity: 1 }];
      
      saveCart(newItems);
      return { items: newItems };
    });
  },
  removeItem: (productId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.productId !== productId);
      saveCart(newItems);
      return { items: newItems };
    });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity < 1) return;
    set((state) => {
      const newItems = state.items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      );
      saveCart(newItems);
      return { items: newItems };
    });
  },
  clearCart: () => {
    set({ items: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_KEY);
    }
  },
  getCartCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
  getSubtotal: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
}));
