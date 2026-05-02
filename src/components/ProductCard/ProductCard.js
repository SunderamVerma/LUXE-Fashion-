import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiEye } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const isWished = wishlist.map(String).includes(String(product.id));

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="product-card__image-wrapper">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} className="product-card__image" loading="lazy" />
        </Link>

        {/* Badges */}
        <div className="product-card__badges">
          {product.isNew && <span className="product-card__badge product-card__badge--new">New</span>}
          {discount && <span className="product-card__badge product-card__badge--sale">-{discount}%</span>}
        </div>

        {/* Quick Actions */}
        <div className="product-card__actions">
          <button
            type="button"
            className={`product-card__action ${isWished ? 'product-card__action--active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            aria-label="Add to wishlist"
          >
            <FiHeart size={16} />
          </button>
          <Link to={`/product/${product.id}`} className="product-card__action" aria-label="Quick view">
            <FiEye size={16} />
          </Link>
          <button
            type="button"
            className="product-card__action"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              addToCart({ ...product, size: product.sizes?.[0] || '', color: product.colors?.[0]?.name || '' });
            }}
            aria-label="Add to cart"
          >
            <FiShoppingBag size={16} />
          </button>
        </div>
      </div>

      <div className="product-card__info">
        <p className="product-card__brand">{product.brand}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="product-card__name">{product.name}</h3>
        </Link>
        <div className="product-card__price-row">
          <span className="product-card__price">${product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="product-card__original-price">${product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        <div className="product-card__colors">
          {(product.colors || []).map((c) => (
            <span
              key={c.name}
              className="product-card__color-dot"
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
