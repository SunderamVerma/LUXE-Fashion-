import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import authService from '../../services/authService';
import './Navbar.css';

const megaMenuData = {
  women: {
    categories: ['Dresses', 'Blazers', 'Skirts', 'Tops', 'Pants', 'Knitwear'],
    featured: 'New Arrivals',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=400&fit=crop',
  },
  men: {
    categories: ['Suits', 'Coats', 'Jackets', 'Shirts', 'Trousers', 'Knitwear'],
    featured: 'Tailoring',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop',
  },
  accessories: {
    categories: ['Bags', 'Jewelry', 'Eyewear', 'Watches', 'Scarves', 'Belts'],
    featured: 'Gift Guide',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=300&h=400&fit=crop',
  },
};

function toSlug(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, '-');
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMega, setActiveMega] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const { cartCount } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveMega(null);
    setSearchOpen(false);
    setSearchTerm('');
  }, [location]);

  useEffect(() => {
    const syncAuthState = () => setIsAuthenticated(authService.isAuthenticated());

    syncAuthState();
    window.addEventListener('auth-changed', syncAuthState);
    window.addEventListener('storage', syncAuthState);

    return () => {
      window.removeEventListener('auth-changed', syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const trimmedSearch = searchTerm.trim();
    navigate(trimmedSearch ? `/products?search=${encodeURIComponent(trimmedSearch)}` : '/products');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner container">
          <button className="navbar__mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>

          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-text">LUXÉ</span>
          </Link>

          <ul className="navbar__links">
            {['women', 'men', 'accessories'].map((cat) => (
              <li
                key={cat}
                className="navbar__link-item"
                onMouseEnter={() => setActiveMega(cat)}
                onMouseLeave={() => setActiveMega(null)}
                onFocus={() => setActiveMega(cat)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setActiveMega(null);
                  }
                }}
              >
                <Link to={`/products?category=${cat}`} className="navbar__link">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  <FiChevronDown size={12} className="navbar__link-arrow" />
                </Link>

                <AnimatePresence>
                  {activeMega === cat && (
                    <motion.div
                      className="mega-menu"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="mega-menu__content">
                        <div className="mega-menu__section">
                          <h4 className="mega-menu__heading">Categories</h4>
                          <ul className="mega-menu__list">
                            {megaMenuData[cat].categories.map((item) => (
                              <li key={item}>
                                <Link to={`/products?category=${cat}&subcategory=${toSlug(item)}`} className="mega-menu__item">
                                  {item}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mega-menu__section">
                          <h4 className="mega-menu__heading">Featured</h4>
                          <Link to={`/products?category=${cat}`} className="mega-menu__featured">
                            {megaMenuData[cat].featured}
                          </Link>
                          <Link to="/products" className="mega-menu__cta">
                            View All →
                          </Link>
                        </div>
                        <div className="mega-menu__image-wrapper">
                          <img src={megaMenuData[cat].image} alt={cat} className="mega-menu__image" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
            <li className="navbar__link-item">
              <Link to="/products" className="navbar__link">Collections</Link>
            </li>
          </ul>

          <div className="navbar__actions">
            <button className="navbar__action" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
              <FiSearch size={18} />
            </button>
            {isAuthenticated ? (
              <Link to="/dashboard" className="navbar__action" aria-label="Account">
                <FiUser size={18} />
              </Link>
            ) : (
              <>
                <Link to="/auth?type=user&mode=login" className="navbar__auth-link">Sign In</Link>
                <Link to="/auth?type=user&mode=register" className="navbar__auth-cta">Sign Up</Link>
              </>
            )}
            {isAuthenticated && (
              <button className="navbar__auth-link navbar__auth-link--ghost" type="button" onClick={handleLogout}>
                Sign Out
              </button>
            )}
            <Link to="/wishlist" className="navbar__action" aria-label="Wishlist">
              <FiHeart size={18} />
            </Link>
            <Link to="/cart" className="navbar__action navbar__cart" aria-label="Cart">
              <FiShoppingBag size={18} />
              {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="navbar__search"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="container">
                <form className="navbar__search-inner" onSubmit={handleSearchSubmit}>
                  <FiSearch size={18} className="navbar__search-icon" />
                  <input
                    type="text"
                    placeholder="Search for products, brands, categories..."
                    className="navbar__search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  <button type="button" className="navbar__search-close" onClick={() => setSearchOpen(false)}>
                    <FiX size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <div className="mobile-menu__header">
              <span className="navbar__logo-text">LUXÉ</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu"><FiX size={24} /></button>
            </div>
            <ul className="mobile-menu__links">
              <li><Link to="/products?category=women">Women</Link></li>
              <li><Link to="/products?category=men">Men</Link></li>
              <li><Link to="/products?category=accessories">Accessories</Link></li>
              <li><Link to="/products">Collections</Link></li>
              {isAuthenticated ? (
                <>
                  <li><Link to="/dashboard">My Account</Link></li>
                  <li><button type="button" className="mobile-menu__signout" onClick={handleLogout}>Sign Out</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/auth?mode=login">Sign In</Link></li>
                  <li><Link to="/auth?mode=register">Sign Up</Link></li>
                </>
              )}
              <li><Link to="/cart">Shopping Bag ({cartCount})</Link></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: 'var(--nav-height)' }} />
    </>
  );
}
