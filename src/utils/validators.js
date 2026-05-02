/**
 * Form Validators using Zod
 * Centralized schema validation for all forms
 */

import { z } from 'zod';

// ==========================
// Common Schemas
// ==========================
const emailSchema = z.string().email('Invalid email address');
const phoneSchema = z.string().regex(/^[\d\-\+\(\)\s]+$/, 'Invalid phone number').min(10, 'Phone number too short');
const zipSchema = z.string().min(3, 'Invalid ZIP code').max(20);

// ==========================
// Auth Schemas
// ==========================
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ==========================
// Address Schemas
// ==========================
export const addressSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: emailSchema,
  phone: phoneSchema,
  street: z.string().min(5, 'Street address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  zip: zipSchema,
  country: z.string().min(2, 'Country required'),
});

// ==========================
// Payment Schemas
// ==========================
export const cardPaymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{13,19}$/, 'Invalid card number'),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3-4 digits'),
  nameOnCard: z.string().min(3, 'Name on card required'),
});

export const upiPaymentSchema = z.object({
  upiId: z.string().email('Invalid UPI ID').endsWith('@upi', 'Invalid UPI format'),
});

export const paymentSchema = z.union([
  z.object({ method: z.literal('card'), ...cardPaymentSchema.shape }),
  z.object({ method: z.literal('upi'), ...upiPaymentSchema.shape }),
  z.object({ method: z.literal('cod') }),
]);

// ==========================
// Checkout Schemas
// ==========================
export const checkoutSchema = z.object({
  address: addressSchema,
  payment: paymentSchema,
});

// ==========================
// Product Schemas
// ==========================
export const productSchema = z.object({
  name: z.string().min(3, 'Product name required').max(100),
  brand: z.string().min(2, 'Brand required'),
  description: z.string().min(10, 'Description required'),
  price: z.number().positive('Price must be positive'),
  originalPrice: z.number().positive().optional(),
  category: z.string().min(1, 'Category required'),
  subcategory: z.string().min(1, 'Subcategory required'),
  sizes: z.array(z.string()).min(1, 'At least one size required'),
  colors: z.array(z.object({
    name: z.string(),
    hex: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  })).min(1, 'At least one color required'),
  rating: z.number().min(0).max(5),
  reviews: z.number().nonnegative(),
  isNew: z.boolean().default(false),
  isTrending: z.boolean().default(false),
});

// ==========================
// User Profile Schemas
// ==========================
export const userProfileSchema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName: z.string().min(2, 'Last name required'),
  email: emailSchema,
  phone: phoneSchema,
});

// ==========================
// Validation Utility
// ==========================
export const validate = async (schema, data) => {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated, errors: {} };
  } catch (error) {
    const errors = {};
    const issues = error?.issues || error?.errors || [];
    if (issues.length) {
      issues.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
    }
    return { success: false, data: null, errors };
  }
};
