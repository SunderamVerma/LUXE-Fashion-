import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiTag } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import './Cart.css';

export default function Cart() {
  const { cart, cartTotal, removeFromCart, updateCartQuantity } = useApp();

  const shipping = cartTotal > 500 ? 0 : 25;
  const tax = Math.round(cartTotal * 0.06);
  const total = cartTotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="container">
          <motion.div
            className="cart-empty__content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="cart-empty__icon">
              <FiShoppingBag size={48} />
            </div>
            <h2 className="cart-empty__title">Your Bag is Empty</h2>
            <p className="cart-empty__text">
              Looks like you haven't added anything to your bag yet.
              Explore our curated collections to find something you'll love.
            </p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping <FiArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="cart__title">Shopping Bag</h1>
          <p className="cart__count">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
        </motion.div>

        <div className="cart__layout">
          {/* Cart Items */}
          <div className="cart__items">
            <AnimatePresence>
              {cart.map((item, i) => (
                <motion.div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="cart-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link to={`/product/${item.id}`} className="cart-item__image-wrapper">
                    <img src={item.image} alt={item.name} className="cart-item__image" />
                  </Link>

                  <div className="cart-item__details">
                    <div className="cart-item__top">
                      <div>
                        <p className="cart-item__brand">{item.brand}</p>
                        <Link to={`/product/${item.id}`}>
                          <h3 className="cart-item__name">{item.name}</h3>
                        </Link>
                        <div className="cart-item__meta">
                          <span>Size: {item.size}</span>
                          <span>Color: {item.color}</span>
                        </div>
                      </div>
                      <button
                        className="cart-item__remove"
                        onClick={() => removeFromCart(item)}
                        aria-label="Remove item"
                      >
                        <FiX size={18} />
                      </button>
                    </div>

                    <div className="cart-item__bottom">
                      <div className="cart-item__quantity">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.size, item.color, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.size, item.color, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                      <span className="cart-item__price">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <motion.div
            className="cart-summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="cart-summary__inner">
              <h3 className="cart-summary__title">Order Summary</h3>

              <div className="cart-summary__promo">
                <FiTag size={16} />
                <input type="text" placeholder="Promo code" className="cart-summary__promo-input" />
                <button className="cart-summary__promo-btn">Apply</button>
              </div>

              <div className="cart-summary__rows">
                <div className="cart-summary__row">
                  <span>Subtotal</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
                <div className="cart-summary__row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Complimentary' : `$${shipping}`}</span>
                </div>
                <div className="cart-summary__row">
                  <span>Estimated Tax</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <div className="cart-summary__row cart-summary__row--total">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>

              {shipping === 0 && (
                <p className="cart-summary__free-shipping">
                  ✓ You qualify for complimentary shipping
                </p>
              )}

              <Link to="/checkout" className="btn btn-primary cart-summary__checkout">
                Proceed to Checkout
              </Link>

              <Link to="/products" className="cart-summary__continue">
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
