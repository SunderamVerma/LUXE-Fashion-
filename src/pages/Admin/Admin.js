import React, { useEffect, useMemo, useState } from 'react';
import { usersApi, ordersApi, authApi } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiPackage, FiDollarSign, FiUsers, FiShoppingCart,
  FiTrendingUp, FiEdit2, FiTrash2, FiPlus, FiSearch,
  FiBarChart2, FiBox, FiSettings, FiX, FiCheck
} from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import './Admin.css';

const ADMIN_TABS = [
  { id: 'overview', label: 'Overview', icon: FiBarChart2 },
  { id: 'products', label: 'Products', icon: FiBox },
  { id: 'orders', label: 'Orders', icon: FiShoppingCart },
  { id: 'users', label: 'Users', icon: FiUsers },
  { id: 'settings', label: 'Settings', icon: FiSettings },
];

const statusColors = {
  'Processing': { bg: '#fef3c7', text: '#d97706' },
  'Shipped': { bg: '#dbeafe', text: '#2563eb' },
  'In Transit': { bg: '#dbeafe', text: '#2563eb' },
  'Delivered': { bg: '#d1fae5', text: '#059669' },
};

const STATUS_OPTIONS = ['Processing', 'In Transit', 'Delivered'];

const EMPTY_PRODUCT_FORM = {
  name: '',
  brand: 'LUXE Originals',
  category: 'women',
  subcategory: 'dresses',
  price: '',
  originalPrice: '',
  image: '',
  description: '',
  rating: '4.5',
  isNew: false,
  isTrending: false,
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductEditorOpen, setIsProductEditorOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [productError, setProductError] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminError, setAdminError] = useState('');
  const [isLoadingAdminData, setIsLoadingAdminData] = useState(true);
  const {
    user: currentUser,
    products,
    categories,
    orders,
    storeSettings,
    createProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus,
    updateStoreSettings,
  } = useApp();

  useEffect(() => {
    let cancelled = false;

    const loadAdminData = async () => {
      setIsLoadingAdminData(true);
      setAdminError('');

      try {
        const [usersResponse, ordersResponse] = await Promise.all([
          usersApi.getAll(),
          ordersApi.getAll(),
        ]);

        if (cancelled) return;

        setAdminUsers(Array.isArray(usersResponse) ? usersResponse : []);
        setAdminOrders(Array.isArray(ordersResponse) ? ordersResponse : []);
      } catch (error) {
        if (cancelled) return;
        setAdminError(error.message || 'Unable to load admin data. Please sign in with an admin account.');
        setAdminUsers([]);
        setAdminOrders([]);
      } finally {
        if (!cancelled) {
          setIsLoadingAdminData(false);
        }
      }
    };

    loadAdminData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => products.filter((product) =>
    [product.name, product.brand, product.category, product.subcategory]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()))
  ), [products, searchQuery]);

  const availableCategorySlugs = useMemo(() => {
    if (categories.length) return categories.map((category) => category.slug);
    return ['women', 'men', 'accessories', 'shoes', 'beauty'];
  }, [categories]);

  const liveOrders = adminOrders.length > 0 ? adminOrders : orders;
  const normalizedOrders = useMemo(() => liveOrders.map((order) => ({
    id: order.id || order._id,
    customerName: order.user?.name || order.user?.email || order.customerName || 'Guest Customer',
    date: (order.createdAt || order.date || '').toString().split('T')[0],
    total: order.totalPrice ?? order.total ?? 0,
    status: order.status || 'Processing',
    paymentMethod: order.paymentMethod || 'card',
  })), [liveOrders]);
  const recentOrders = normalizedOrders.slice(0, 5);
  const totalRevenue = liveOrders.reduce((sum, order) => sum + (order.totalPrice ?? order.total ?? 0), 0);
  const userMetrics = useMemo(() => {
    return adminUsers.map((profile) => {
      const profileOrders = liveOrders.filter((order) => {
        const orderUserId = order.user?._id || order.user?.id || order.user;
        return String(orderUserId) === String(profile._id || profile.id)
          || String(order.user?.email || '') === String(profile.email || '');
      });

      return {
        ...profile,
        orderCount: profileOrders.length,
        totalSpent: profileOrders.reduce((sum, order) => sum + (order.totalPrice ?? order.total ?? 0), 0),
      };
    });
  }, [adminUsers, liveOrders]);
  const totalUsers = adminUsers.length || (currentUser?.role === 'admin' ? 1 : 0);
  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: 'Live', icon: FiDollarSign, color: '#c9a96e' },
    { label: 'Total Orders', value: liveOrders.length.toLocaleString(), change: 'Live', icon: FiShoppingCart, color: '#3b82f6' },
    { label: 'Total Users', value: totalUsers.toLocaleString(), change: 'Live', icon: FiUsers, color: '#8b5cf6' },
    { label: 'Products', value: products.length.toLocaleString(), change: 'Live', icon: FiPackage, color: '#059669' },
  ];

  const handleOrderStatusChange = async (orderId, nextStatus) => {
    await updateOrderStatus(orderId, nextStatus);
    setAdminOrders((currentOrders) => currentOrders.map((order) => (
      String(order.id || order._id) === String(orderId)
        ? { ...order, status: nextStatus }
        : order
    )));
  };

  const resetProductEditor = () => {
    setEditingProductId(null);
    setProductForm(EMPTY_PRODUCT_FORM);
    setProductError('');
    setIsProductEditorOpen(false);
  };

  const startCreateProduct = () => {
    setEditingProductId(null);
    setProductForm(EMPTY_PRODUCT_FORM);
    setProductError('');
    setIsProductEditorOpen(true);
  };

  const startEditProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      subcategory: product.subcategory,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      image: product.image,
      description: product.description,
      rating: String(product.rating),
      isNew: !!product.isNew,
      isTrending: !!product.isTrending,
    });
    setProductError('');
    setIsProductEditorOpen(true);
  };

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductForm((currentForm) => ({
      ...currentForm,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim() || !productForm.brand.trim() || !productForm.subcategory.trim() || !productForm.image.trim() || !productForm.description.trim()) {
      setProductError('Fill in all required product fields before saving.');
      return;
    }

    const parsedPrice = Number(productForm.price);
    const parsedOriginalPrice = productForm.originalPrice ? Number(productForm.originalPrice) : null;
    const parsedRating = Number(productForm.rating);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setProductError('Price must be a number greater than 0.');
      return;
    }

    const selectedCategory = categories.find((category) => category.slug === productForm.category);
    if (!selectedCategory) {
      setProductError('Invalid category selected.');
      return;
    }

    const baseProduct = {
      name: productForm.name.trim(),
      brand: productForm.brand.trim(),
      category: selectedCategory.id,
      subcategory: productForm.subcategory.trim().toLowerCase(),
      price: parsedPrice,
      originalPrice: Number.isFinite(parsedOriginalPrice) && parsedOriginalPrice > parsedPrice ? parsedOriginalPrice : null,
      images: [productForm.image.trim()],
      description: productForm.description.trim(),
      rating: Number.isFinite(parsedRating) ? parsedRating : 4.5,
      numReviews: 0,
      sizes: productForm.category === 'shoes' ? ['39', '40', '41', '42', '43'] : ['XS', 'S', 'M', 'L', 'XL'],
      colors: [{ name: 'Black', hex: '#0a0a0a' }, { name: 'Ivory', hex: '#f5f0eb' }],
      isNew: productForm.isNew,
      isTrending: productForm.isTrending,
      countInStock: 20,
    };

    try {
      if (editingProductId) {
        await updateProduct({ id: editingProductId, ...baseProduct });
      } else {
        await createProduct(baseProduct);
      }
      resetProductEditor();
    } catch (err) {
      setProductError(err.message || 'Failed to save product.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        if (editingProductId === productId) {
          resetProductEditor();
        }
      } catch (err) {
        setProductError(err.message || 'Failed to delete product.');
      }
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    updateStoreSettings({ [name]: value });
    setSettingsSaved(false);
  };

  const handleSaveSettings = async () => {
    try {
      await authApi.updateMe({ storeSettings });
      updateStoreSettings(storeSettings);
      setSettingsSaved(true);
    } catch (error) {
      setAdminError(error.message || 'Failed to save store settings.');
    }
  };

  return (
    <div className="admin">
      <div className="admin__layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar__logo">
            <span>LUXÉ</span>
            <small>Admin Panel</small>
          </div>
          <nav className="admin-sidebar__nav">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`admin-sidebar__item ${activeTab === tab.id ? 'admin-sidebar__item--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          <div className="admin-main__header">
            <h1 className="admin-main__title">
              {ADMIN_TABS.find((t) => t.id === activeTab)?.label}
            </h1>
            <div className="admin-main__actions">
              <div className="admin-search">
                <FiSearch size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {adminError && (
            <div className="admin-form__error" style={{ marginBottom: '16px' }}>
              <FiX size={16} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>{adminError}</div>
                {String(adminError).toLowerCase().includes('admin access') && (
                  <Link to="/auth" style={{ marginLeft: 8, color: '#c9a96e', fontWeight: 600 }}>Sign in as admin</Link>
                )}
              </div>
            </div>
          )}

          {/* Overview */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Stats */}
              <div className="admin-stats">
                {stats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      className="admin-stat"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="admin-stat__icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                        <Icon size={22} />
                      </div>
                      <div className="admin-stat__info">
                        <span className="admin-stat__label">{stat.label}</span>
                        <span className="admin-stat__value">{stat.value}</span>
                        <span className="admin-stat__change" style={{ color: '#059669' }}>
                          <FiTrendingUp size={12} /> {stat.change}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Recent Orders */}
              <div className="admin-section">
                <div className="admin-section__header">
                  <h2>Recent Orders</h2>
                  <button className="admin-section__link">View All</button>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingAdminData ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>Loading orders...</td></tr>
                      ) : recentOrders.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>No orders found</td></tr>
                      ) : recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="admin-table__id">{order.id}</td>
                          <td>{order.customerName || 'Guest Customer'}</td>
                          <td>{order.date}</td>
                          <td className="admin-table__price">${order.total.toLocaleString()}</td>
                          <td>
                            <select value={order.status} onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}>
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                          <td>{order.paymentMethod || 'card'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Products */}
          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-section">
                <div className="admin-section__header">
                  <h2>Product Management</h2>
                  <button className="btn btn-primary admin-section__cta" onClick={startCreateProduct}>
                    <FiPlus size={16} /> Add New Product
                  </button>
                </div>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Rating</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>No products found</td></tr>
                      ) : (
                        filteredProducts.map((product) => (
                          <tr key={product.id}>
                            <td>
                              <div className="admin-table__product">
                                <img src={product.image} alt={product.name} />
                                <div>
                                  <span className="admin-table__product-name">{product.name}</span>
                                  <span className="admin-table__product-brand">{product.brand}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ textTransform: 'capitalize' }}>{product.category}</td>
                            <td className="admin-table__price">${product.price}</td>
                            <td>{product.rating} ★</td>
                            <td>{product.countInStock || 20}</td>
                            <td>
                              <div className="admin-table__actions">
                                <button className="admin-table__btn--edit" aria-label="Edit" onClick={() => startEditProduct(product)}><FiEdit2 size={14} /></button>
                                <button className="admin-table__btn--delete" aria-label="Delete" onClick={() => handleDeleteProduct(product.id)}><FiTrash2 size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-section">
                <h2>Order Management</h2>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {normalizedOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="admin-table__id">{order.id}</td>
                          <td>{order.customerName || 'Guest Customer'}</td>
                          <td>{order.date}</td>
                          <td className="admin-table__price">${order.total.toLocaleString()}</td>
                          <td>
                            <select value={order.status} onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}>
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                          <td>{order.paymentMethod || 'card'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-section">
                <h2>User Management</h2>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Orders</th>
                        <th>Total Spent</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoadingAdminData ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>Loading users...</td></tr>
                      ) : userMetrics.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>No users found</td></tr>
                      ) : userMetrics.map((user) => (
                        <tr key={user.email}>
                          <td>
                            <div className="admin-table__user">
                              <div className="admin-table__user-avatar">{user.name[0]}</div>
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{user.orderCount}</td>
                          <td className="admin-table__price">${Number(user.totalSpent || 0).toLocaleString()}</td>
                          <td>{user.role || 'customer'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="admin-section">
                <h2>Store Settings</h2>
                <div className="admin-settings">
                  <div className="admin-settings__group">
                    <label>Store Name</label>
                    <input name="storeName" type="text" value={storeSettings.storeName} onChange={handleSettingsChange} />
                  </div>
                  <div className="admin-settings__group">
                    <label>Contact Email</label>
                    <input name="contactEmail" type="email" value={storeSettings.contactEmail} onChange={handleSettingsChange} />
                  </div>
                  <div className="admin-settings__group">
                    <label>Currency</label>
                    <select name="currency" value={storeSettings.currency} onChange={handleSettingsChange}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handleSaveSettings}>Save Settings</button>
                  {settingsSaved && <p style={{ color: '#059669', marginTop: '12px' }}>Settings saved to your profile.</p>}
                </div>
              </div>
            </motion.div>
          )}
        </main>

        {/* Product Editor Modal */}
        <AnimatePresence>
          {isProductEditorOpen && (
              <motion.div
                className="admin-modal__backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={resetProductEditor}
              >
                <motion.div
                  className="admin-modal"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="admin-modal__header">
                    <h2>{editingProductId ? 'Edit Product' : 'Create New Product'}</h2>
                    <button className="admin-modal__close" onClick={resetProductEditor} aria-label="Close">
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="admin-modal__content">
                    <div className="admin-modal__grid">
                      <div className="admin-form__group">
                        <label>Product Name *</label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Luxurious Satin Dress"
                          value={productForm.name}
                          onChange={handleProductFormChange}
                        />
                      </div>

                      <div className="admin-form__group">
                        <label>Brand *</label>
                        <input
                          type="text"
                          name="brand"
                          placeholder="LUXE Originals"
                          value={productForm.brand}
                          onChange={handleProductFormChange}
                        />
                      </div>

                      <div className="admin-form__group">
                        <label>Category *</label>
                        <select name="category" value={productForm.category} onChange={handleProductFormChange}>
                          {availableCategorySlugs.map((slug) => (
                            <option key={slug} value={slug}>
                              {slug.charAt(0).toUpperCase() + slug.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="admin-form__group">
                        <label>Subcategory *</label>
                        <input
                          type="text"
                          name="subcategory"
                          placeholder="e.g., dresses, shirts"
                          value={productForm.subcategory}
                          onChange={handleProductFormChange}
                        />
                      </div>

                      <div className="admin-form__group">
                        <label>Price ($) *</label>
                        <input
                          type="number"
                          name="price"
                          min="0"
                          step="0.01"
                          placeholder="99.99"
                          value={productForm.price}
                          onChange={handleProductFormChange}
                        />
                      </div>

                      <div className="admin-form__group">
                        <label>Original Price ($)</label>
                        <input
                          type="number"
                          name="originalPrice"
                          min="0"
                          step="0.01"
                          placeholder="149.99"
                          value={productForm.originalPrice}
                          onChange={handleProductFormChange}
                        />
                      </div>

                      <div className="admin-form__group">
                        <label>Rating (1-5)</label>
                        <input
                          type="number"
                          name="rating"
                          min="1"
                          max="5"
                          step="0.1"
                          value={productForm.rating}
                          onChange={handleProductFormChange}
                        />
                      </div>

                      <div className="admin-form__group">
                        <label>Image URL *</label>
                        <input
                          type="text"
                          name="image"
                          placeholder="https://..."
                          value={productForm.image}
                          onChange={handleProductFormChange}
                        />
                        {productForm.image && (
                          <div className="admin-form__image-preview">
                            <img src={productForm.image} alt="Preview" />
                          </div>
                        )}
                      </div>

                      <div className="admin-form__group admin-form__group--full">
                        <label>Description *</label>
                        <textarea
                          name="description"
                          placeholder="Detailed product description..."
                          value={productForm.description}
                          onChange={handleProductFormChange}
                          rows="4"
                        />
                      </div>

                      <div className="admin-form__group--checkbox">
                        <label>
                          <input
                            type="checkbox"
                            name="isNew"
                            checked={productForm.isNew}
                            onChange={handleProductFormChange}
                          />
                          <span>Mark as New Arrival</span>
                        </label>
                      </div>

                      <div className="admin-form__group--checkbox">
                        <label>
                          <input
                            type="checkbox"
                            name="isTrending"
                            checked={productForm.isTrending}
                            onChange={handleProductFormChange}
                          />
                          <span>Mark as Trending</span>
                        </label>
                      </div>
                    </div>

                    {productError && (
                      <div className="admin-form__error">
                        <FiX size={16} />
                        {productError}
                      </div>
                    )}
                  </div>

                  <div className="admin-modal__footer">
                    <button className="btn btn-secondary" onClick={resetProductEditor}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSaveProduct}>
                      <FiCheck size={16} />
                      {editingProductId ? 'Update Product' : 'Create Product'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
