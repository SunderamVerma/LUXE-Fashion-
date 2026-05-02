/**
 * Tests for Validators
 * Unit tests for form validation schemas
 */

import { validate, loginSchema, registerSchema, addressSchema, checkoutSchema } from '../utils/validators';

describe('Validators', () => {
  describe('loginSchema', () => {
    test('should validate correct login data', async () => {
      const data = { email: 'user@example.com', password: 'password123' };
      const result = await validate(loginSchema, data);
      expect(result.success).toBe(true);
    });

    test('should reject invalid email', async () => {
      const data = { email: 'invalid-email', password: 'password123' };
      const result = await validate(loginSchema, data);
      expect(result.success).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    test('should reject short password', async () => {
      const data = { email: 'user@example.com', password: '123' };
      const result = await validate(loginSchema, data);
      expect(result.success).toBe(false);
      expect(result.errors.password).toBeDefined();
    });
  });

  describe('registerSchema', () => {
    test('should validate correct registration data', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };
      const result = await validate(registerSchema, data);
      expect(result.success).toBe(true);
    });

    test('should reject mismatched passwords', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'different',
      };
      const result = await validate(registerSchema, data);
      expect(result.success).toBe(false);
      expect(result.errors.confirmPassword).toBeDefined();
    });
  });

  describe('addressSchema', () => {
    test('should validate correct address', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1 234 567 8900',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      };
      const result = await validate(addressSchema, data);
      expect(result.success).toBe(true);
    });

    test('should reject invalid phone', async () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: 'invalid',
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'USA',
      };
      const result = await validate(addressSchema, data);
      expect(result.success).toBe(false);
      expect(result.errors.phone).toBeDefined();
    });
  });

  describe('checkoutSchema', () => {
    test('should validate complete checkout with card payment', async () => {
      const data = {
        address: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1 234 567 8900',
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'USA',
        },
        payment: {
          method: 'card',
          cardNumber: '4532123456789010',
          expiry: '12/25',
          cvv: '123',
          nameOnCard: 'John Doe',
        },
      };
      const result = await validate(checkoutSchema, data);
      expect(result.success).toBe(true);
    });
  });
});
