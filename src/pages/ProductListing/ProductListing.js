import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown, FiGrid, FiList, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductCard from '../../components/ProductCard/ProductCard';
import { useApp } from '../../context/AppContext';
import { ITEMS_PER_PAGE } from '../../constants/appConstants';
import './ProductListing.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under $500', min: 0, max: 500 },
  { label: '$500 - $1000', min: 500, max: 1000 },
  { label: '$1000 - $2000', min: 1000, max: 2000 },
  { label: 'Over $2000', min: 2000, max: Infinity },
];

export default function ProductListing() {
  const { products, categories, loading } = useApp();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const subcategoryParam = searchParams.get('subcategory') || 'all';
  const searchQuery = searchParams.get('search')?.trim() || '';

  const [category, setCategory] = useState(categoryParam);
  const [subcategory, setSubcategory] = useState('all');
  const [priceRange, setPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridView, setGridView] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setCategory(categoryParam);
    setSubcategory(subcategoryParam);
    setPage(1);
  }, [categoryParam, subcategoryParam]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase();
      result = result.filter((product) =>
        [product.name, product.brand, product.categoryName, product.category, product.subcategory, product.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      );
    }

    // Category filter
    if (category !== 'all') {
      result = result.filter((p) => p.category === category);
    }

    // Subcategory filter
    if (subcategory !== 'all') {
      result = result.filter((p) => p.subcategory === subcategory);
    }

    // Price filter
    const range = PRICE_RANGES[priceRange];
    result = result.filter((p) => p.price >= range.min && p.price < range.max);

    // Sort
    switch (sortBy) {
      case 'newest':
        result = result.filter((p) => p.isNew).concat(result.filter((p) => !p.isNew));
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [category, subcategory, priceRange, products, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const categoryOptions = useMemo(() => {
    if (categories.length) {
      return categories.map((cat) => cat.slug || cat.id).filter(Boolean);
    }
    return [...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [categories, products]);

  const availableSubcats = useMemo(() => {
    if (category === 'all') return [];
    return [...new Set(products
      .filter((p) => p.category === category)
      .map((p) => p.subcategory)
      .filter(Boolean))];
  }, [category, products]);

  return (
    <div className="product-listing">
      {/* Header */}
      <section className="listing-header">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="section-subtitle">{searchQuery ? `Search: ${searchQuery}` : 'Shop'}</p>
            <h1 className="section-title">
              {searchQuery
                ? <>Results for <span>{searchQuery}</span></>
                : <>{category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)} <span>Collection</span></>}
            </h1>
          </motion.div>
        </div>
      </section>

      <div className="container">
        <div className="listing-content">
          {/* Toolbar */}
          <div className="listing-toolbar">
            <div className="listing-toolbar__left">
              <button
                className="listing-toolbar__filter-btn"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <FiFilter size={16} />
                Filters
              </button>
              <span className="listing-toolbar__count">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>
            <div className="listing-toolbar__right">
              <div className="listing-toolbar__sort">
                <FiChevronDown size={14} />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="listing-toolbar__view">
                <button
                  className={`listing-toolbar__view-btn ${gridView ? 'active' : ''}`}
                  onClick={() => setGridView(true)}
                  aria-label="Grid view"
                >
                  <FiGrid size={16} />
                </button>
                <button
                  className={`listing-toolbar__view-btn ${!gridView ? 'active' : ''}`}
                  onClick={() => setGridView(false)}
                  aria-label="List view"
                >
                  <FiList size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="listing-body">
            {/* Sidebar Filters */}
            <AnimatePresence>
              {filtersOpen && (
                <motion.aside
                  className="listing-filters"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="listing-filters__inner">
                    <div className="listing-filters__header">
                      <h3>Filters</h3>
                      <button onClick={() => setFiltersOpen(false)} aria-label="Close filters"><FiX size={18} /></button>
                    </div>

                    {/* Category */}
                    <div className="filter-group">
                      <h4 className="filter-group__title">Category</h4>
                      {['all', ...categoryOptions].map((cat) => (
                        <label key={cat} className="filter-group__option">
                          <input
                            type="radio"
                            name="category"
                            checked={category === cat}
                            onChange={() => { setCategory(cat); setSubcategory('all'); setPage(1); }}
                          />
                          <span className="filter-group__radio" />
                          <span>{cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                        </label>
                      ))}
                    </div>

                    {/* Subcategory */}
                    {availableSubcats.length > 0 && (
                      <div className="filter-group">
                        <h4 className="filter-group__title">Subcategory</h4>
                        {['all', ...availableSubcats].map((sub) => (
                          <label key={sub} className="filter-group__option">
                            <input
                              type="radio"
                              name="subcategory"
                              checked={subcategory === sub}
                              onChange={() => { setSubcategory(sub); setPage(1); }}
                            />
                            <span className="filter-group__radio" />
                            <span>{sub === 'all' ? 'All' : sub.charAt(0).toUpperCase() + sub.slice(1)}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Price */}
                    <div className="filter-group">
                      <h4 className="filter-group__title">Price Range</h4>
                      {PRICE_RANGES.map((range, i) => (
                        <label key={i} className="filter-group__option">
                          <input
                            type="radio"
                            name="price"
                            checked={priceRange === i}
                            onChange={() => setPriceRange(i)}
                          />
                          <span className="filter-group__radio" />
                          <span>{range.label}</span>
                        </label>
                      ))}
                    </div>

                    {/* Colors */}
                    <div className="filter-group">
                      <h4 className="filter-group__title">Colors</h4>
                      <div className="filter-group__colors">
                        {['#0a0a0a', '#f5f0eb', '#c9a96e', '#722F37', '#000080', '#36454F'].map((color) => (
                          <button
                            key={color}
                            className="filter-group__color-btn"
                            style={{ backgroundColor: color }}
                            aria-label={`Color ${color}`}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      className="btn btn-primary listing-filters__clear"
                      onClick={() => { setCategory('all'); setSubcategory('all'); setPriceRange(0); setPage(1); }}
                    >
                      Clear All Filters
                    </button>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Product Grid */}
            <div className={`listing-grid ${gridView ? 'listing-grid--grid' : 'listing-grid--list'} ${filtersOpen ? 'listing-grid--with-filters' : ''}`}>
              <AnimatePresence mode="wait">
                {!loading && paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))
                ) : (
                  <motion.div
                    className="listing-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h3>{loading ? 'Loading products...' : 'No products found'}</h3>
                    {!loading && <p>{searchQuery ? 'Try a broader search or clear some filters.' : 'Try adjusting your filters to find what you\'re looking for.'}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="listing-pagination">
                  <button
                    className="listing-pagination__btn"
                    disabled={page === 1}
                    onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    aria-label="Previous page"
                  >
                    <FiChevronLeft size={18} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let p;
                    if (totalPages <= 7) p = i + 1;
                    else if (page <= 4) p = i + 1;
                    else if (page >= totalPages - 3) p = totalPages - 6 + i;
                    else p = page - 3 + i;
                    return (
                      <button
                        key={p}
                        className={`listing-pagination__btn ${page === p ? 'active' : ''}`}
                        onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    className="listing-pagination__btn"
                    disabled={page === totalPages}
                    onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    aria-label="Next page"
                  >
                    <FiChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
