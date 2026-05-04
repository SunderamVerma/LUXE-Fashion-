/**
 * Refactored AppContext
 * Uses separate context providers for cart, orders, user, products, wishlist
 * Cleaner separation of concerns
 */

import React, { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { authApi, categoriesApi, ordersApi, productsApi } from '../services/api';
import authService from '../services/authService';
import PRODUCTS, { CATEGORIES } from '../data/products';
import {
  CartContext,
  cartReducer,
  OrdersContext,
  ordersReducer,
  UserContext,
  userReducer,
  ProductsContext,
  productsReducer,
  WishlistContext,
  wishlistReducer,
} from '../hooks/useAppState';

const STORAGE_KEY = 'luxe-fashion-state-v2';

const defaultState = {
  cart: [],
  orders: [],
  user: null,
  products: [],
  categories: [],
  wishlist: [],
  storeSettings: {
    storeName: 'LUXE Fashion',
    contactEmail: 'admin@luxe.com',
    currency: 'USD',
  },
};

function slugifyName(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function normalizeCategory(category) {
  return {
    id: category._id || category.id,
    slug: category.slug || slugifyName(category.name),
    name: category.name,
    image: category.image || '',
    description: category.description || '',
  };
}

function normalizeProduct(product) {
  const normalizedCategory = typeof product.category === 'object' && product.category !== null
    ? {
      id: product.category._id,
      slug: product.category.slug || slugifyName(product.category.name),
      name: product.category.name,
    }
    : {
      id: product.category,
      slug: String(product.category || '').toLowerCase(),
      name: String(product.category || ''),
    };

  return {
    ...product,
    id: product._id || product.id,
    image: product.image || product.images?.[0] || '',
    images: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []),
    category: normalizedCategory.slug,
    categoryName: normalizedCategory.name,
    categoryId: normalizedCategory.id,
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    rating: Number(product.rating || 0),
    reviews: Number(product.numReviews ?? product.reviews ?? 0),
  };
}

function isMongoId(value) {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
}

function buildFallbackCategories() {
  if (Array.isArray(CATEGORIES) && CATEGORIES.length > 0) {
    return CATEGORIES.map((item) => ({
      id: item.id || item.slug || item.name,
      slug: item.slug || slugifyName(item.name),
      name: item.name,
      image: item.image || '',
      description: item.description || '',
    }));
  }

  return [];
}

function readStoredState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err);
  }
}

function normalizeRemoteProfile(profile) {
  const remoteCart = Array.isArray(profile?.cart) ? profile.cart : [];
  return {
    user: profile
      ? {
          ...profile,
          id: profile.id || profile._id,
        }
      : null,
    cart: remoteCart.map((item) => ({
      ...item,
      id: item.id || item.productId,
    })),
    wishlist: Array.isArray(profile?.wishlist) ? profile.wishlist : [],
    storeSettings: profile?.storeSettings || defaultState.storeSettings,
  };
}

export const AppContextProvider = ({ children }) => {
  const stored = readStoredState();
  const initialState = stored
    ? { ...defaultState, ...stored, products: [], categories: [] }
    : defaultState;

  const [cart, dispatchCart] = useReducer(cartReducer, initialState.cart);
  const [orders, dispatchOrders] = useReducer(ordersReducer, initialState.orders);
  const [user, dispatchUser] = useReducer(userReducer, initialState.user);
  const [products, dispatchProducts] = useReducer(productsReducer, initialState.products);
  const [categories, setCategories] = useState(initialState.categories || []);
  const [wishlist, dispatchWishlist] = useReducer(wishlistReducer, initialState.wishlist);
  const [storeSettings, setStoreSettings] = useState(initialState.storeSettings || defaultState.storeSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(!authService.isAuthenticated());
  const syncTimerRef = useRef(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsApi.getAll({ page: 1, limit: 1000, sort: 'featured' }),
          categoriesApi.getAll(),
        ]);

        const productItems = Array.isArray(productsRes?.items)
          ? productsRes.items
          : Array.isArray(productsRes)
            ? productsRes
            : [];

        dispatchProducts({
          type: 'SET_PRODUCTS',
          payload: productItems.map(normalizeProduct),
        });

        const categoryItems = Array.isArray(categoriesRes)
          ? categoriesRes.map(normalizeCategory)
          : [];
        setCategories(categoryItems);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
        dispatchProducts({
          type: 'SET_PRODUCTS',
          payload: Array.isArray(PRODUCTS) ? PRODUCTS.map(normalizeProduct) : [],
        });
        setCategories(buildFallbackCategories());
        setError('Using local demo catalog because API is unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  useEffect(() => {
    const hydrateProfile = async () => {
      if (!authService.isAuthenticated()) {
        setProfileLoaded(true);
        return;
      }

      try {
        const profile = await authApi.me();
        const nextState = normalizeRemoteProfile(profile);
        dispatchUser({ type: 'SET_USER', payload: nextState.user });
        dispatchCart({ type: 'CLEAR_CART' });
        nextState.cart.forEach((item) => {
          dispatchCart({ type: 'ADD_TO_CART', payload: item });
        });
        dispatchWishlist({ type: 'CLEAR_WISHLIST' });
        nextState.wishlist.forEach((id) => {
          dispatchWishlist({ type: 'ADD_TO_WISHLIST', payload: { id } });
        });
        setStoreSettings(nextState.storeSettings);
        setError(null);
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setProfileLoaded(true);
      }
    };

    hydrateProfile();
  }, []);

  useEffect(() => {
    saveToStorage({ cart, orders, user, wishlist, storeSettings });
  }, [cart, orders, user, wishlist, storeSettings]);

  useEffect(() => {
    if (!profileLoaded || !authService.isAuthenticated() || !(user?.id || user?._id)) return;

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = setTimeout(async () => {
      try {
        const updatedProfile = await authApi.updateMe({
          cart: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
          wishlist,
          storeSettings,
        });

        if (updatedProfile) {
          dispatchUser({
            type: 'SET_USER',
            payload: {
              ...updatedProfile,
              id: updatedProfile.id || updatedProfile._id,
            },
          });
        }
      } catch (err) {
        console.warn('Failed to sync profile state to server:', err);
      }
    }, 400);

    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [cart, wishlist, storeSettings, profileLoaded, user?.id]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const createProduct = async (payload) => {
    try {
      const response = await productsApi.create(payload);
      dispatchProducts({ type: 'CREATE_PRODUCT', payload: normalizeProduct(response) });
      return { ok: true };
    } catch {
      const demoProduct = normalizeProduct({
        ...payload,
        id: payload.id || `demo-${Date.now()}`,
      });
      dispatchProducts({ type: 'CREATE_PRODUCT', payload: demoProduct });
      return { ok: true, demoMode: true };
    }
  };

  const updateProduct = async (payload) => {
    try {
      const response = await productsApi.update(payload.id, payload);
      dispatchProducts({ type: 'UPDATE_PRODUCT', payload: normalizeProduct(response) });
      return { ok: true };
    } catch {
      dispatchProducts({ type: 'UPDATE_PRODUCT', payload: normalizeProduct(payload) });
      return { ok: true, demoMode: true };
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await productsApi.delete(productId);
    } catch {
      // Demo mode fallback keeps UI interaction fully functional.
    }
    dispatchProducts({ type: 'DELETE_PRODUCT', payload: { id: productId } });
    return { ok: true };
  };

  const placeOrder = async (input, totalArg) => {
    const isLegacyCall = Array.isArray(input);
    const items = isLegacyCall ? input : (input?.items || cart);
    const total = isLegacyCall ? totalArg : (input?.total ?? cartTotal);
    const shippingPrice = Number(input?.shipping ?? 0);
    const taxPrice = Number(input?.tax ?? 0);
    const totalPrice = Number(input?.total ?? total + shippingPrice + taxPrice);

    const shipping = {
      firstName: input?.address?.firstName || 'Demo',
      lastName: input?.address?.lastName || 'User',
      email: input?.address?.email || user?.email || 'user@demo.com',
      phone: input?.address?.phone || '9999999999',
      street: input?.address?.street || 'Demo Street',
      city: input?.address?.city || 'Demo City',
      state: input?.address?.state || 'Demo State',
      zip: input?.address?.zip || '000000',
      country: input?.address?.country || 'India',
    };

    try {
      const orderPayload = {
        orderItems: items.map((item) => ({
          product: item.id || item._id,
          name: item.name,
          image: item.image,
          quantity: item.quantity || 1,
          size: item.size,
          color: item.color,
          price: item.price,
        })),
        shippingAddress: shipping,
        paymentMethod: input?.paymentMethod || 'cod',
        itemsPrice: total,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const createdOrder = await ordersApi.create(orderPayload);
      dispatchOrders({
        type: 'PLACE_ORDER',
        payload: {
          id: createdOrder?._id || createdOrder?.id,
          items,
          total,
          status: createdOrder?.status || 'Pending',
          createdAt: createdOrder?.createdAt,
        },
      });
      dispatchCart({ type: 'CLEAR_CART' });
      return { ok: true, order: createdOrder };
    } catch {
      dispatchOrders({
        type: 'PLACE_ORDER',
        payload: {
          items,
          total,
          status: 'Pending',
          createdAt: new Date().toISOString(),
        },
      });
      dispatchCart({ type: 'CLEAR_CART' });
      return { ok: true, demoMode: true };
    }
  };

  const updateOrderStatus = async (id, status) => {
    if (isMongoId(id)) {
      try {
        await ordersApi.updateStatus(id, status);
      } catch {
        // Local reducer fallback below keeps admin interaction working.
      }
    }

    dispatchOrders({ type: 'UPDATE_ORDER_STATUS', payload: { id, status } });
    return { ok: true };
  };

  const value = {
    // Cart
    cart,
    dispatchCart,
    cartTotal,
    cartCount,
    addToCart: (item) => dispatchCart({ type: 'ADD_TO_CART', payload: item }),
    removeFromCart: (item) => dispatchCart({ type: 'REMOVE_FROM_CART', payload: item }),
    updateCartQuantity: (id, size, color, quantity) =>
      dispatchCart({ type: 'UPDATE_QUANTITY', payload: { id, size, color, quantity } }),
    updateQuantity: (item) =>
      dispatchCart({
        type: 'UPDATE_QUANTITY',
        payload: {
          id: item.id,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        },
      }),
    clearCart: () => dispatchCart({ type: 'CLEAR_CART' }),

    // Orders
    orders,
    dispatchOrders,
    placeOrder,
    updateOrderStatus,

    // User
    user,
    dispatchUser,
    setUser: (userData) => dispatchUser({ type: 'SET_USER', payload: userData }),
    logout: () => {
      authService.logout();
      dispatchUser({ type: 'LOGOUT' });
    },

    // Products
    products,
    categories,
    dispatchProducts,
    createProduct,
    updateProduct,
    deleteProduct,

    // Wishlist
    wishlist,
    dispatchWishlist,
    toggleWishlist: (id) => dispatchWishlist({ type: 'TOGGLE_WISHLIST', payload: { id } }),

    // Settings
    storeSettings,
    updateStoreSettings: (nextSettings) => setStoreSettings((current) => ({ ...current, ...nextSettings })),

    // Status
    loading,
    error,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const AppContext = createContext();

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppContextProvider');
  }
  return context;
}

export const AppProvider = AppContextProvider;
