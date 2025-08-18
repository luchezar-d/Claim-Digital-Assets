import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

// Cart state shape
const initialState = {
  open: false,
  items: [],
  itemCount: 0,
  subtotalCents: 0,
  loading: false,
  initialLoad: true, // Track if we're still doing the initial cart load
  error: null,
};

// Action types
const CART_ACTIONS = {
  OPEN_CART: 'OPEN_CART',
  CLOSE_CART: 'CLOSE_CART',
  SET_LOADING: 'SET_LOADING',
  SET_CART_DATA: 'SET_CART_DATA',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  REMOVE_ITEM_OPTIMISTIC: 'REMOVE_ITEM_OPTIMISTIC',
  ADD_ITEM_OPTIMISTIC: 'ADD_ITEM_OPTIMISTIC',
};

// Reducer
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.OPEN_CART:
      return { ...state, open: true };
    case CART_ACTIONS.CLOSE_CART:
      return { ...state, open: false };
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case CART_ACTIONS.SET_CART_DATA:
      return {
        ...state,
        items: action.payload.items || [],
        itemCount: action.payload.itemCount || 0,
        subtotalCents: action.payload.subtotalCents || 0,
        loading: false,
        initialLoad: false, // Mark initial load as complete
        error: null,
      };
    case CART_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case CART_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case CART_ACTIONS.REMOVE_ITEM_OPTIMISTIC:
      const filteredItems = state.items.filter(item => item._id !== action.payload);
      const newItemCount = Math.max(0, state.itemCount - 1);
      // Recalculate subtotal
      const newSubtotalCents = filteredItems.reduce((sum, item) => sum + (item.priceCents || 0), 0);
      return {
        ...state,
        items: filteredItems,
        itemCount: newItemCount,
        subtotalCents: newSubtotalCents,
      };
    case CART_ACTIONS.ADD_ITEM_OPTIMISTIC:
      return {
        ...state,
        items: [...state.items, action.payload],
        itemCount: state.itemCount + 1,
        subtotalCents: state.subtotalCents + (action.payload.priceCents || 0),
      };
    default:
      return state;
  }
}

// Context
const CartContext = createContext();

// Provider component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // API Actions
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const response = await api.get('/cart');
      dispatch({ type: CART_ACTIONS.SET_CART_DATA, payload: response.data });
    } catch (error) {
      console.error('Error fetching cart:', error);
      dispatch({ 
        type: CART_ACTIONS.SET_ERROR, 
        payload: error.response?.data?.message || 'Failed to fetch cart' 
      });
    }
  }, [isAuthenticated]);

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      dispatch({ type: CART_ACTIONS.SET_CART_DATA, payload: { items: [], itemCount: 0, subtotalCents: 0 } });
    }
  }, [isAuthenticated, user, fetchCart]);

  // UI Actions
  const openCart = useCallback(() => {
    dispatch({ type: CART_ACTIONS.OPEN_CART });
  }, []);

  const closeCart = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLOSE_CART });
  }, []);

  const toggleCart = useCallback(() => {
    dispatch({ type: state.open ? CART_ACTIONS.CLOSE_CART : CART_ACTIONS.OPEN_CART });
  }, [state.open]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      // Don't show loading spinner for add operations to keep UI smooth
      const response = await api.post('/cart/items', { productId, quantity });
      dispatch({ type: CART_ACTIONS.SET_CART_DATA, payload: response.data });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add item to cart';
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: errorMessage });
      throw new Error(errorMessage);
    }
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const response = await api.patch(`/cart/items/${itemId}`, { quantity });
      dispatch({ type: CART_ACTIONS.SET_CART_DATA, payload: response.data });
    } catch (error) {
      console.error('Error updating cart item:', error);
      dispatch({ 
        type: CART_ACTIONS.SET_ERROR, 
        payload: error.response?.data?.message || 'Failed to update item' 
      });
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    // Optimistically remove the item first for instant UI feedback
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM_OPTIMISTIC, payload: itemId });
    
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      // Update with actual server data to ensure consistency
      dispatch({ type: CART_ACTIONS.SET_CART_DATA, payload: response.data });
    } catch (error) {
      console.error('Error removing cart item:', error);
      // If the API call fails, refetch the cart to restore the correct state
      fetchCart();
      dispatch({ 
        type: CART_ACTIONS.SET_ERROR, 
        payload: error.response?.data?.message || 'Failed to remove item' 
      });
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const response = await api.post('/cart/clear');
      dispatch({ type: CART_ACTIONS.SET_CART_DATA, payload: response.data });
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ 
        type: CART_ACTIONS.SET_ERROR, 
        payload: error.response?.data?.message || 'Failed to clear cart' 
      });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    // State
    ...state,
    // UI Actions
    openCart,
    closeCart,
    toggleCart,
    // API Actions
    fetchCart,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    clearError,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
