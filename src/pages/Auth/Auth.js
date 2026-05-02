import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight, FiShield } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import authService from '../../services/authService';
import { validate, loginSchema, registerSchema } from '../../utils/validators';
import './Auth.css';

const initialLogin = {
  email: '',
  password: '',
};

const initialRegister = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function Auth() {
  const [params] = useSearchParams();
  const accountType = params.get('type') || 'user'; // 'user' or 'admin'
  const initialMode = params.get('mode') === 'register' ? 'register' : 'login';
  
  const [mode, setMode] = useState(initialMode);
  const [type, setType] = useState(accountType);
  const [userLoginForm, setUserLoginForm] = useState(initialLogin);
  const [userRegisterForm, setUserRegisterForm] = useState(initialRegister);
  const [adminLoginForm, setAdminLoginForm] = useState(initialLogin);
  const [adminRegisterForm, setAdminRegisterForm] = useState(initialRegister);
  const [formErrors, setFormErrors] = useState({});
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useApp();

  const isUserMode = type === 'user';
  const loginForm = isUserMode ? userLoginForm : adminLoginForm;
  const registerForm = isUserMode ? userRegisterForm : adminRegisterForm;
  const setLoginForm = isUserMode ? setUserLoginForm : setAdminLoginForm;
  const setRegisterForm = isUserMode ? setUserRegisterForm : setAdminRegisterForm;

  const heroTitle = useMemo(() => {
    if (isUserMode) {
      return mode === 'login' ? 'Welcome back' : 'Create your account';
    } else {
      return mode === 'login' ? 'Admin Portal' : 'Register Admin';
    }
  }, [mode, isUserMode]);

  const heroCopy = useMemo(() => {
    if (isUserMode) {
      return mode === 'login'
        ? 'Sign in to track orders, save your wishlist, and continue shopping.'
        : 'Join LUXÉ to create an account, save your details, and shop faster.';
    } else {
      return mode === 'login'
        ? 'Access the admin panel to manage products, orders, and store settings.'
        : 'Create an admin account with elevated privileges.';
    }
  }, [mode, isUserMode]);

  const handleTypeChange = (newType) => {
    setType(newType);
    setMode('login');
    setFormErrors({});
    setFormMessage('');
  };

  const goToSession = (user) => {
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }
    navigate('/dashboard');
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormMessage('');

    const validation = await validate(loginSchema, loginForm);
    if (!validation.success) {
      setFormErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    setFormErrors({});
    const result = await authService.login(loginForm.email, loginForm.password, isUserMode ? 'customer' : 'admin');

    if (result.success) {
      setUser(result.user);
      goToSession(result.user);
      return;
    }

    setFormMessage(result.error || 'Unable to sign in.');
    setIsSubmitting(false);
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormMessage('');

    const validation = await validate(registerSchema, registerForm);
    if (!validation.success) {
      setFormErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    setFormErrors({});

    const registrationData = {
      name: `${registerForm.firstName} ${registerForm.lastName}`,
      email: registerForm.email,
      password: registerForm.password,
      role: isUserMode ? 'customer' : 'admin',
    };

    const result = await authService.register(registrationData);

    if (result.success) {
      setUser(result.user);
      goToSession(result.user);
      return;
    }

    setFormMessage(result.error || 'Unable to create account.');
    setIsSubmitting(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-page__glow auth-page__glow--one" />
      <div className="auth-page__glow auth-page__glow--two" />

      <div className="container auth-page__inner">
        {/* Type Selector */}
        <motion.div
          className="auth-page__type-selector"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <button
            className={`auth-type-btn ${isUserMode ? 'auth-type-btn--active' : ''}`}
            onClick={() => handleTypeChange('user')}
          >
            <FiUser size={20} />
            <span>User Account</span>
          </button>
          <button
            className={`auth-type-btn ${!isUserMode ? 'auth-type-btn--active' : ''}`}
            onClick={() => handleTypeChange('admin')}
          >
            <FiShield size={20} />
            <span>Admin Portal</span>
          </button>
        </motion.div>

        <motion.div
          className="auth-page__hero"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          key={type}
        >
          <p className="auth-page__eyebrow">{isUserMode ? 'LUXÉ Member Access' : 'LUXÉ Admin Portal'}</p>
          <h1>{heroTitle}</h1>
          <p>{heroCopy}</p>
        </motion.div>

        <motion.div
          className="auth-page__panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          key={`${type}-${mode}`}
        >
          <div className="auth-form__tabs">
            <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => { setMode('login'); setFormErrors({}); setFormMessage(''); }}>
              Sign In
            </button>
            <button type="button" className={mode === 'register' ? 'is-active' : ''} onClick={() => { setMode('register'); setFormErrors({}); setFormMessage(''); }}>
              Sign Up
            </button>
          </div>

          {mode === 'login' ? (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <label>
                <span><FiMail size={14} /> Email</span>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                  placeholder="you@example.com"
                />
                {formErrors.email && <strong>{formErrors.email}</strong>}
              </label>

              <label>
                <span><FiLock size={14} /> Password</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  placeholder="Your password"
                />
                {formErrors.password && <strong>{formErrors.password}</strong>}
              </label>

              {formMessage && <p className="auth-form__message">{formMessage}</p>}

              <button className="btn btn-primary auth-form__submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              <div className="auth-form__grid">
                <label>
                  <span><FiUser size={14} /> First Name</span>
                  <input
                    type="text"
                    value={registerForm.firstName}
                    onChange={(event) => setRegisterForm({ ...registerForm, firstName: event.target.value })}
                    placeholder="Alexandra"
                  />
                  {formErrors.firstName && <strong>{formErrors.firstName}</strong>}
                </label>

                <label>
                  <span><FiUser size={14} /> Last Name</span>
                  <input
                    type="text"
                    value={registerForm.lastName}
                    onChange={(event) => setRegisterForm({ ...registerForm, lastName: event.target.value })}
                    placeholder="Chen"
                  />
                  {formErrors.lastName && <strong>{formErrors.lastName}</strong>}
                </label>
              </div>

              <label>
                <span><FiMail size={14} /> Email</span>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                  placeholder="you@example.com"
                />
                {formErrors.email && <strong>{formErrors.email}</strong>}
              </label>

              <label>
                <span><FiLock size={14} /> Password</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                  placeholder="Create a password"
                />
                {formErrors.password && <strong>{formErrors.password}</strong>}
              </label>

              <label>
                <span><FiLock size={14} /> Confirm Password</span>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(event) => setRegisterForm({ ...registerForm, confirmPassword: event.target.value })}
                  placeholder="Repeat your password"
                />
                {formErrors.confirmPassword && <strong>{formErrors.confirmPassword}</strong>}
              </label>

              {formMessage && <p className="auth-form__message">{formMessage}</p>}

              <button className="btn btn-primary auth-form__submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}