import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiStar } from 'react-icons/fi';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useApp } from '../../context/AppContext';
import './Home.css';

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&h=1080&fit=crop',
    subtitle: 'Spring / Summer 2026',
    title: 'The Art of\nElegance',
    cta: 'Discover Collection',
  },
  {
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&h=1080&fit=crop',
    subtitle: 'New Arrivals',
    title: 'Timeless\nSophistication',
    cta: 'Shop Now',
  },
  {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=1080&fit=crop',
    subtitle: 'Exclusive Edit',
    title: 'Define Your\nStyle',
    cta: 'Explore',
  },
];

export default function Home() {
  const { products, categories, loading } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const trendingProducts = products.filter((p) => p.isTrending).slice(0, 12);
  const newProducts = products.filter((p) => p.isNew).slice(0, 12);
  const derivedCategories = categories.length
    ? categories
    : [...new Set(products.map((p) => p.category))].map((slug) => ({
      id: slug,
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      image: products.find((p) => p.category === slug)?.image || '',
    }));
  const itemsPerView = typeof window !== 'undefined' && window.innerWidth < 768 ? 2 : 4;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextCarousel = () => {
    setCarouselIndex((prev) => Math.min(prev + 1, trendingProducts.length - itemsPerView));
  };

  const prevCarousel = () => {
    setCarouselIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="home">
      {/* ========== HERO ========== */}
      <section className="hero" ref={heroRef}>
        <motion.div className="hero__bg" style={{ scale: heroScale, opacity: heroOpacity }}>
          {heroSlides.map((slide, i) => (
            <div
              key={i}
              className={`hero__slide ${i === currentSlide ? 'hero__slide--active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}
          <div className="hero__overlay" />
        </motion.div>

        <div className="hero__content container">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hero__text"
          >
            <span className="hero__subtitle">{heroSlides[currentSlide].subtitle}</span>
            <h1 className="hero__title">
              {heroSlides[currentSlide].title.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
            </h1>
            <Link to="/products" className="btn btn-white hero__cta">
              {heroSlides[currentSlide].cta}
              <FiArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Slide Indicators */}
          <div className="hero__indicators">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                className={`hero__indicator ${i === currentSlide ? 'hero__indicator--active' : ''}`}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========== BRAND BAR ========== */}
      <section className="brand-bar">
        <div className="brand-bar__inner">
          {['VOGUE', 'HARPER\'S BAZAAR', 'ELLE', 'GQ', 'VANITY FAIR', 'W MAGAZINE'].map((name) => (
            <span key={name} className="brand-bar__name">{name}</span>
          ))}
        </div>
      </section>

      {/* ========== CATEGORIES ========== */}
      <section className="section categories">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Shop by</p>
            <h2 className="section-title">Curated <span>Categories</span></h2>
          </div>

          <div className="categories__grid">
            {derivedCategories.map((cat, i) => (
              <motion.div
                key={cat.id || cat.slug}
                className="category-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <Link to={`/products?category=${cat.slug || cat.id}`}>
                  <div className="category-card__image-wrapper">
                    <img src={cat.image} alt={cat.name} className="category-card__image" loading="lazy" />
                    <div className="category-card__overlay" />
                    <div className="category-card__content">
                      <h3 className="category-card__name">{cat.name}</h3>
                      <span className="category-card__cta">
                        Explore <FiArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TRENDING PRODUCTS CAROUSEL ========== */}
      <section className="section trending">
        <div className="container">
          <div className="trending__header">
            <div>
              <p className="section-subtitle">What's Hot</p>
              <h2 className="section-title">Trending <span>Now</span></h2>
            </div>
            <div className="trending__controls">
              <button className="trending__arrow" onClick={prevCarousel} disabled={carouselIndex === 0} aria-label="Previous">
                <FiArrowLeft size={20} />
              </button>
              <button
                className="trending__arrow"
                onClick={nextCarousel}
                disabled={carouselIndex >= trendingProducts.length - itemsPerView}
                aria-label="Next"
              >
                <FiArrowRight size={20} />
              </button>
            </div>
          </div>

          <div className="trending__carousel">
            <motion.div
              className="trending__track"
              animate={{ x: `-${carouselIndex * (100 / itemsPerView)}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {(loading ? [] : trendingProducts).map((product, i) => (
                <div key={product.id} className="trending__item" style={{ minWidth: `${100 / itemsPerView}%` }}>
                  <ProductCard product={product} index={i} />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== PROMO BANNER ========== */}
      <section className="promo">
        <div className="promo__inner container">
          <motion.div
            className="promo__content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="promo__label">Limited Time</span>
            <h2 className="promo__title">
              Exclusive <br />
              <span>Members Sale</span>
            </h2>
            <p className="promo__desc">
              Up to 40% off on selected pieces from our most coveted collections.
              Members enjoy early access and complimentary shipping.
            </p>
            <Link to="/products" className="btn btn-gold">
              Shop the Sale <FiArrowRight size={16} />
            </Link>
          </motion.div>
          <motion.div
            className="promo__image-wrapper"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&h=900&fit=crop"
              alt="Members Sale"
              className="promo__image"
            />
            <div className="promo__image-accent" />
          </motion.div>
        </div>
      </section>

      {/* ========== NEW ARRIVALS ========== */}
      <section className="section new-arrivals">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Just In</p>
            <h2 className="section-title">New <span>Arrivals</span></h2>
          </div>

          <div className="new-arrivals__grid">
            {(loading ? [] : newProducts.slice(0, 4)).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          <div className="new-arrivals__cta">
            <Link to="/products" className="btn btn-secondary">
              View All Products <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIAL ========== */}
      <section className="section testimonial">
        <div className="container">
          <motion.div
            className="testimonial__inner"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="testimonial__stars">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={16} fill="var(--color-gold)" color="var(--color-gold)" />
              ))}
            </div>
            <blockquote className="testimonial__quote">
              "LUXÉ has completely transformed my wardrobe. The quality is unmatched,
              and every piece feels like it was made just for me."
            </blockquote>
            <div className="testimonial__author">
              <span className="testimonial__name">Alexandra Chen</span>
              <span className="testimonial__role">Fashion Editor, Vogue</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
