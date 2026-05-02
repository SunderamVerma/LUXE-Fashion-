import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiArrowRight } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="footer">
      {/* Newsletter */}
      <div className="footer__newsletter">
        <div className="container">
          <div className="footer__newsletter-inner">
            <div className="footer__newsletter-text">
              <h3 className="footer__newsletter-title">Join the LUXÉ World</h3>
              <p className="footer__newsletter-desc">
                Subscribe for exclusive access to new collections, private sales, and style inspiration.
              </p>
            </div>
            <form className="footer__newsletter-form" onSubmit={handleSubscribe}>
              <div className="footer__newsletter-input-wrapper">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="footer__newsletter-input"
                  required
                />
                <button type="submit" className="footer__newsletter-btn" aria-label="Subscribe">
                  <FiArrowRight size={18} />
                </button>
              </div>
              {subscribed && (
                <span className="footer__newsletter-success">Welcome to LUXÉ ✓</span>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__brand">
              <h2 className="footer__logo">LUXÉ</h2>
              <p className="footer__tagline">
                Redefining luxury fashion with timeless elegance and contemporary design.
              </p>
              <div className="footer__social">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram">
                  <FiInstagram size={18} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Twitter">
                  <FiTwitter size={18} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Facebook">
                  <FiFacebook size={18} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="YouTube">
                  <FiYoutube size={18} />
                </a>
              </div>
            </div>

            <div className="footer__column">
              <h4 className="footer__column-title">Shop</h4>
              <ul className="footer__column-links">
                <li><Link to="/products?category=women">Women</Link></li>
                <li><Link to="/products?category=men">Men</Link></li>
                <li><Link to="/products?category=accessories">Accessories</Link></li>
                <li><Link to="/products">New Arrivals</Link></li>
                <li><Link to="/products">Sale</Link></li>
              </ul>
            </div>

            <div className="footer__column">
              <h4 className="footer__column-title">Company</h4>
              <ul className="footer__column-links">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/sustainability">Sustainability</Link></li>
                <li><Link to="/press">Press</Link></li>
                <li><Link to="/stores">Stores</Link></li>
              </ul>
            </div>

            <div className="footer__column">
              <h4 className="footer__column-title">Help</h4>
              <ul className="footer__column-links">
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/shipping">Shipping</Link></li>
                <li><Link to="/returns">Returns</Link></li>
                <li><Link to="/size-guide">Size Guide</Link></li>
                <li><Link to="/faqs">FAQs</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container">
          <div className="footer__bottom-inner">
            <p>© 2026 LUXÉ. All rights reserved.</p>
            <div className="footer__bottom-links">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookie-policy">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
