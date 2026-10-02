import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const storageKey = 'morrow-cart';

function readStoredCart() {
  if (typeof window === 'undefined') return [];

  try {
    const storedItems = JSON.parse(window.localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(storedItems)) return [];

    return storedItems.filter((item) =>
      item && typeof item.id === 'string' && Number.isFinite(item.price) && Number.isInteger(item.quantity) && item.quantity > 0,
    );
  } catch {
    return [];
  }
}

function normalizeQuantity(quantity) {
  const parsedQuantity = Math.floor(Number(quantity));
  return Number.isFinite(parsedQuantity) ? Math.min(99, Math.max(1, parsedQuantity)) : 1;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // The cart still works for this session when browser storage is unavailable.
    }
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    const productId = product?._id || product?.id;
    if (!productId || !Number.isFinite(product.price)) return;
    const amount = normalizeQuantity(quantity);
    const cartProduct = { ...product, id: String(productId) };

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === cartProduct.id);
      if (existingItem) {
        return currentItems.map((item) =>
          item.id === cartProduct.id ? { ...item, quantity: normalizeQuantity(item.quantity + amount) } : item,
        );
      }

      return [...currentItems, { ...cartProduct, quantity: amount }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    const amount = normalizeQuantity(quantity);
    setItems((currentItems) => currentItems.map((item) =>
      item.id === productId ? { ...item, quantity: amount } : item,
    ));
  };

  const clearCart = () => setItems([]);
  const calculateSubtotal = () => items.reduce((subtotal, item) => subtotal + item.price * item.quantity, 0);
  const calculateTotal = () => calculateSubtotal();
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, calculateSubtotal, calculateTotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}