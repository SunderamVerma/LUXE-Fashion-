import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiHeart } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Wishlist.css';

export default function Wishlist() {
  const { wishlist, products } = useApp();

  const wishedProducts = products.filter((product) =>
    wishlist.map(String).includes(String(product.id))
  );

  return (
    <div className="wishlist-page">
      <div className="wishlist-page__hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="wishlist-page__hero-content"
          >
            <h1 className="wishlist-page__title">
              <FiHeart size={32} className="wishlist-page__icon" />
              My Wishlist
            </h1>
            <p className="wishlist-page__subtitle">
              {wishedProducts.length === 0
                ? 'Your wishlist is empty. Start adding items you love!'
                : `You have ${wishedProducts.length} item${wishedProducts.length !== 1 ? 's' : ''} in your wishlist`}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container wishlist-page__inner">
        {wishedProducts.length === 0 ? (
          <motion.div
            className="wishlist-page__empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FiHeart size={48} className="wishlist-page__empty-icon" />
            <h2>No items in your wishlist yet</h2>
            <p>Explore our collections and add your favorite items to the wishlist.</p>
            <Link to="/products" className="btn btn-primary wishlist-page__cta">
              Continue Shopping <FiArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="wishlist-page__grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {wishedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
