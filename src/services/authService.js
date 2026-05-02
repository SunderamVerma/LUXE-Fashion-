/**
 * Auth Service
 * Handles JWT token management and authentication state
 */

import { authApi } from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const emitAuthChange = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('auth-changed'));
};

const normalizeUser = (response = {}, fallbackEmail = '') => {
  const source = response?.data && typeof response.data === 'object' ? response.data : response;
  return {
    id: source?._id || source?.id || `local-${Date.now()}`,
    name: source?.name || source?.username || 'User',
    email: source?.email || fallbackEmail,
    role: source?.role || 'customer',
    avatar: source?.avatar || '',
    cart: Array.isArray(source?.cart) ? source.cart : [],
    wishlist: Array.isArray(source?.wishlist) ? source.wishlist : [],
    storeSettings: source?.storeSettings || {
      storeName: 'LUXE Fashion',
      contactEmail: 'admin@luxe.com',
      currency: 'USD',
    },
  };
};

const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  emitAuthChange();
};

export const authService = {
  // Get stored token
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  // Get stored user
  getUser: () => {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!authService.getToken();
  },

  // Login
  login: async (email, password, expectedRole = 'customer') => {
    try {
      console.log('Login attempt:', { email, expectedRole });
      const response = await authApi.login(email, password);
      console.log('Login API response:', response);

      if (response?.token) {
        const user = normalizeUser(response, email);
        console.log('Normalized user:', user, 'Expected role:', expectedRole);
        
        // Verify the role matches what was expected
        if (user.role !== expectedRole) {
          console.error('Role mismatch:', { userRole: user.role, expectedRole });
          return { 
            success: false, 
            error: `This account is not registered as a ${expectedRole}. Please use the correct login portal.` 
          };
        }
        
        saveSession(response.token, user);
        return { success: true, user };
      }

      throw new Error('No token received');
    } catch (err) {
      console.error('Login failed:', err);
      return { success: false, error: err.message || 'Invalid email or password. Please check your credentials.' };
    }
  },

  // Register
  register: async (userData) => {
    try {
      console.log('Registration request data:', userData);
      const response = await authApi.register(userData);
      console.log('Registration API response:', response);

      if (response?.token) {
        const user = normalizeUser(response, userData?.email);
        console.log('Normalized user:', user);
        saveSession(response.token, user);
        console.log('Account created successfully:', user.email);
        return { success: true, user };
      }

      throw new Error('Registration failed - no token received');
    } catch (err) {
      console.error('Registration failed:', err);
      
      // Extract meaningful error message from backend response
      let errorMessage = err.message || 'Registration failed';
      
      if (err.payload?.message) {
        errorMessage = err.payload.message;
      } else if (err.status === 409) {
        errorMessage = 'An account with this email already exists';
      } else if (err.status === 400) {
        errorMessage = 'Invalid registration data. Please check all fields.';
      } else if (err.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      return { success: false, error: errorMessage };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    emitAuthChange();
    return { success: true };
  },

  // Verify token is still valid
  verifyToken: async () => {
    const token = authService.getToken();
    if (!token) return false;

    try {
      await authApi.verifyToken();
      return true;
    } catch {
      authService.logout();
      return false;
    }
  },
};

export default authService;
