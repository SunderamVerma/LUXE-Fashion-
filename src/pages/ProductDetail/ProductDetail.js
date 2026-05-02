import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiStar, FiTruck, FiRefreshCw, FiShield, FiMinus, FiPlus } from 'react-icons/fi';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useApp } from '../../context/AppContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart, toggleWishlist, wishlist, products } = useApp();
  const product = products.find((p) => String(p.id) === String(id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  if (!product) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const isWished = wishlist.map(String).includes(String(product.id));
  const relatedProducts = products.filter(
    (p) => p.category === product.category && String(p.id) !== String(product.id)
  ).slice(0, 4);

  const productImages = product.images && product.images.length ? product.images : [product.image].filter(Boolean);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart({ ...product, size: selectedSize, color: selectedColor });
    }
  };

  const reviews = [
    { id: 1, name: 'Sophie M.', rating: 5, date: '2 weeks ago', text: 'Absolutely stunning piece. The quality exceeds expectations. Fits perfectly true to size.' },
    { id: 2, name: 'James K.', rating: 4, date: '1 month ago', text: 'Beautiful craftsmanship and attention to detail. Slightly longer delivery than expected but worth the wait.' },
    { id: 3, name: 'Elena R.', rating: 5, date: '1 month ago', text: 'This is my third purchase from LUXÉ and they never disappoint. Premium quality through and through.' },
  ];

  return (
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Shop</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Link>
          <span>/</span>
          <span className="breadcrumb__current">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="pd-main">
          {/* Image Gallery */}
          <motion.div
            className="pd-gallery"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="pd-gallery__thumbs">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  className={`pd-gallery__thumb ${selectedImage === i ? 'pd-gallery__thumb--active' : ''}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
            <div className="pd-gallery__main">
              <motion.img
                key={selectedImage}
                src={productImages[selectedImage] || productImages[0]}
                alt={product.name}
                className="pd-gallery__image"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              />
              {product.isNew && <span className="pd-gallery__badge">New Arrival</span>}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="pd-info"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="pd-info__brand">{product.brand}</p>
            <h1 className="pd-info__name">{product.name}</h1>

            <div className="pd-info__rating">
              <div className="pd-info__stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={14}
                    fill={i < Math.floor(product.rating) ? 'var(--color-gold)' : 'none'}
                    color="var(--color-gold)"
                  />
                ))}
              </div>
              <span className="pd-info__rating-text">{product.rating} ({product.reviews || 0} reviews)</span>
            </div>

            <div className="pd-info__price">
              <span className="pd-info__current-price">${product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="pd-info__original-price">${product.originalPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="pd-info__desc">{product.description}</p>

            {/* Color Selection */}
            <div className="pd-info__section">
              <label className="pd-info__label">
                Color: <span>{selectedColor}</span>
              </label>
              <div className="pd-info__colors">
                {(product.colors || []).map((c) => (
                  <button
                    key={c.name}
                    className={`pd-info__color ${selectedColor === c.name ? 'pd-info__color--active' : ''}`}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                    aria-label={`Select color ${c.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="pd-info__section">
              <label className="pd-info__label">
                Size: <span>{selectedSize || 'Select a size'}</span>
              </label>
              <div className="pd-info__sizes">
                {(product.sizes || []).map((size) => (
                  <button
                    key={size}
                    className={`pd-info__size ${selectedSize === size ? 'pd-info__size--active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="pd-info__actions">
              <div className="pd-info__quantity">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  <FiMinus size={16} />
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity">
                  <FiPlus size={16} />
                </button>
              </div>
              <button className="btn btn-primary pd-info__add-to-cart" onClick={handleAddToCart}>
                <FiShoppingBag size={16} />
                Add to Bag
              </button>
              <button
                className={`pd-info__wishlist-btn ${isWished ? 'pd-info__wishlist-btn--active' : ''}`}
                onClick={() => toggleWishlist(product.id)}
                aria-label="Toggle wishlist"
              >
                <FiHeart size={18} />
              </button>
            </div>

            {/* Features */}
            <div className="pd-info__features">
              <div className="pd-info__feature">
                <FiTruck size={18} />
                <span>Complimentary Shipping</span>
              </div>
              <div className="pd-info__feature">
                <FiRefreshCw size={18} />
                <span>30-Day Returns</span>
              </div>
              <div className="pd-info__feature">
                <FiShield size={18} />
                <span>Authenticity Guaranteed</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="pd-tabs">
          <div className="pd-tabs__header">
            {['description', 'reviews', 'shipping'].map((tab) => (
              <button
                key={tab}
                className={`pd-tabs__tab ${activeTab === tab ? 'pd-tabs__tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="pd-tabs__content">
            {activeTab === 'description' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pd-tabs__panel">
                <p>{product.description}</p>
                <ul className="pd-tabs__details">
                  <li>Premium materials sourced from Italy</li>
                  <li>Expert craftsmanship with attention to detail</li>
                  <li>Sustainable and ethically produced</li>
                  <li>Comes with a dust bag and authenticity card</li>
                </ul>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pd-tabs__panel">
                <div className="pd-reviews">
                  {reviews.map((review) => (
                    <div key={review.id} className="pd-review">
                      <div className="pd-review__header">
                        <div className="pd-review__avatar">{review.name[0]}</div>
                        <div>
                          <strong className="pd-review__name">{review.name}</strong>
                          <span className="pd-review__date">{review.date}</span>
                        </div>
                        <div className="pd-review__stars">
                          {[...Array(review.rating)].map((_, i) => (
                            <FiStar key={i} size={12} fill="var(--color-gold)" color="var(--color-gold)" />
                          ))}
                        </div>
                      </div>
                      <p className="pd-review__text">{review.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'shipping' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pd-tabs__panel">
                <h4>Shipping Information</h4>
                <p>All orders are shipped with premium packaging. Standard delivery takes 3-5 business days. Express delivery available for select locations.</p>
                <h4 style={{ marginTop: '16px' }}>Returns</h4>
                <p>We offer a 30-day return policy for unworn items in original condition with tags attached.</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pd-related section">
            <div className="section-header">
              <p className="section-subtitle">You may also like</p>
              <h2 className="section-title">Related <span>Products</span></h2>
            </div>
            <div className="pd-related__grid">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
