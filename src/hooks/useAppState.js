/**
 * Custom Hooks - Split Context API
 * Separate concerns: cart, orders, products, user
 */

import { createContext, useContext } from 'react';

// ==========================
// Cart Hook
// ==========================
export const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export function createCartState(initialCart = []) {
  return initialCart;
}

export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const item = action.payload;
      const existing = state.find(
        (i) => String(i.id) === String(item.id) && i.size === item.size && i.color === item.color
      );
      if (existing) {
        return state.map((i) =>
          String(i.id) === String(existing.id) && i.size === existing.size && i.color === existing.color
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...state, { ...item, quantity: item.quantity || 1 }];
    }

    case 'REMOVE_FROM_CART':
      return state.filter(
        (item) => !(
          String(item.id) === String(action.payload.id) &&
          item.size === action.payload.size &&
          item.color === action.payload.color
        )
      );

    case 'UPDATE_QUANTITY':
      return state.map((item) =>
        String(item.id) === String(action.payload.id) &&
        item.size === action.payload.size &&
        item.color === action.payload.color
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
}

// ==========================
// Orders Hook
// ==========================
export const OrdersContext = createContext();

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider');
  }
  return context;
}

export function ordersReducer(state, action) {
  switch (action.type) {
    case 'PLACE_ORDER':
      const orderCount = state.length + 1;
      const newOrder = {
        id: action.payload.id || `ORD-${new Date().getFullYear()}-${String(orderCount).padStart(3, '0')}`,
        date: (action.payload.createdAt || new Date().toISOString()).split('T')[0],
        status: action.payload.status || 'Processing',
        items: action.payload.items,
        total: action.payload.total,
      };
      return [newOrder, ...state];

    case 'UPDATE_ORDER_STATUS':
      return state.map((order) =>
        String(order.id) === String(action.payload.id)
          ? { ...order, status: action.payload.status }
          : order
      );

    case 'DELETE_ORDER':
      return state.filter((order) => String(order.id) !== String(action.payload.id));

    default:
      return state;
  }
}

// ==========================
// User Hook
// ==========================
export const UserContext = createContext();

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

export function userReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return action.payload;

    case 'LOGOUT':
      return null;

    case 'UPDATE_PROFILE':
      return state ? { ...state, ...action.payload } : null;

    default:
      return state;
  }
}

// ==========================
// Products Hook
// ==========================
export const ProductsContext = createContext();

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductsProvider');
  }
  return context;
}

export function productsReducer(state, action) {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return action.payload;

    case 'CREATE_PRODUCT':
      return [action.payload, ...state];

    case 'UPDATE_PRODUCT':
      return state.map((product) =>
        String(product.id) === String(action.payload.id)
          ? { ...product, ...action.payload }
          : product
      );

    case 'DELETE_PRODUCT':
      return state.filter((product) => String(product.id) !== String(action.payload.id));

    default:
      return state;
  }
}

// ==========================
// Wishlist Hook
// ==========================
export const WishlistContext = createContext();

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}

export function wishlistReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_WISHLIST': {
      const productId = String(action.payload.id);
      return state.map(String).includes(productId)
        ? state.filter((id) => String(id) !== productId)
        : [...state, productId];
    }

    case 'ADD_TO_WISHLIST': {
      const productId = String(action.payload.id);
      return state.map(String).includes(productId)
        ? state
        : [...state, productId];
    }

    case 'REMOVE_FROM_WISHLIST':
      return state.filter((id) => String(id) !== String(action.payload.id));

    case 'CLEAR_WISHLIST':
      return [];

    default:
      return state;
  }
}
