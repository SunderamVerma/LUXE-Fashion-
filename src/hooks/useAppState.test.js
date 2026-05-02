/**
 * Tests for Cart Reducer
 * Unit tests for cart state management
 */

import { cartReducer } from '../hooks/useAppState';

describe('cartReducer', () => {
  const initialState = [];

  test('should add item to empty cart', () => {
    const item = {
      id: 1,
      name: 'Test Product',
      price: 100,
      size: 'M',
      color: 'Red',
      quantity: 1,
    };
    const state = cartReducer(initialState, { type: 'ADD_TO_CART', payload: item });
    expect(state).toHaveLength(1);
    expect(state[0]).toEqual(item);
  });

  test('should increment quantity for existing item with same size and color', () => {
    const initialCart = [
      {
        id: 1,
        name: 'Test Product',
        price: 100,
        size: 'M',
        color: 'Red',
        quantity: 1,
      },
    ];
    const newItem = {
      id: 1,
      name: 'Test Product',
      price: 100,
      size: 'M',
      color: 'Red',
      quantity: 1,
    };
    const state = cartReducer(initialCart, { type: 'ADD_TO_CART', payload: newItem });
    expect(state).toHaveLength(1);
    expect(state[0].quantity).toBe(2);
  });

  test('should treat different sizes as separate items', () => {
    const initialCart = [
      {
        id: 1,
        name: 'Test Product',
        price: 100,
        size: 'M',
        color: 'Red',
        quantity: 1,
      },
    ];
    const newItem = {
      id: 1,
      name: 'Test Product',
      price: 100,
      size: 'L',
      color: 'Red',
      quantity: 1,
    };
    const state = cartReducer(initialCart, { type: 'ADD_TO_CART', payload: newItem });
    expect(state).toHaveLength(2);
  });

  test('should remove item from cart', () => {
    const initialCart = [
      {
        id: 1,
        name: 'Product 1',
        price: 100,
        size: 'M',
        color: 'Red',
        quantity: 1,
      },
      {
        id: 2,
        name: 'Product 2',
        price: 50,
        size: 'S',
        color: 'Blue',
        quantity: 1,
      },
    ];
    const state = cartReducer(initialCart, {
      type: 'REMOVE_FROM_CART',
      payload: { id: 1, size: 'M', color: 'Red' },
    });
    expect(state).toHaveLength(1);
    expect(state[0].id).toBe(2);
  });

  test('should update quantity', () => {
    const initialCart = [
      {
        id: 1,
        name: 'Test Product',
        price: 100,
        size: 'M',
        color: 'Red',
        quantity: 1,
      },
    ];
    const state = cartReducer(initialCart, {
      type: 'UPDATE_QUANTITY',
      payload: { id: 1, size: 'M', color: 'Red', quantity: 5 },
    });
    expect(state[0].quantity).toBe(5);
  });

  test('should not allow quantity below 1', () => {
    const initialCart = [
      {
        id: 1,
        name: 'Test Product',
        price: 100,
        size: 'M',
        color: 'Red',
        quantity: 1,
      },
    ];
    const state = cartReducer(initialCart, {
      type: 'UPDATE_QUANTITY',
      payload: { id: 1, size: 'M', color: 'Red', quantity: 0 },
    });
    expect(state[0].quantity).toBe(1);
  });

  test('should clear entire cart', () => {
    const initialCart = [
      { id: 1, name: 'Product 1', price: 100, size: 'M', color: 'Red', quantity: 2 },
      { id: 2, name: 'Product 2', price: 50, size: 'S', color: 'Blue', quantity: 1 },
    ];
    const state = cartReducer(initialCart, { type: 'CLEAR_CART' });
    expect(state).toHaveLength(0);
  });
});
