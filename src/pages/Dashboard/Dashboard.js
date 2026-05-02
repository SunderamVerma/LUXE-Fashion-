import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiPackage, FiMapPin, FiHeart, FiLogOut, FiEdit2, FiChevronRight, FiTruck, FiCheck, FiClock, FiX, FiShoppingBag } from 'react-icons/fi';
import { authApi } from '../../services/api';
import { useApp } from '../../context/AppContext';
import './Dashboard.css';

const TABS = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'orders', label: 'Orders', icon: FiPackage },
  { id: 'addresses', label: 'Addresses', icon: FiMapPin },
  { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
];

const statusIcons = {
  'Processing': FiClock,
  'In Transit': FiTruck,
  'Delivered': FiCheck,
};

const statusColors = {
  'Processing': '#f59e0b',
  'In Transit': '#3b82f6',
  'Delivered': '#059669',
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const { orders, wishlist, toggleWishlist, addToCart, products, logout, user, setUser } = useApp();
  const navigate = useNavigate();
  const wishlistProducts = products.filter((p) => wishlist.map(String).includes(String(p.id)));

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // Initialize form from context user when available
  const originalProfileRef = useRef(null);
  useEffect(() => {
    if (!user) return;
    const fullName = user.name || '';
    const [firstName = '', ...rest] = fullName.split(' ');
    const lastName = rest.join(' ');
    const next = {
      firstName: firstName || user.firstName || '',
      lastName: lastName || user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
    };
    setProfile(next);
    originalProfileRef.current = next;
  }, [user]);

  const [savingProfile, setSavingProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const updated = await authApi.updateMe({
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email,
        phone: profile.phone,
      });

      // update context user
      if (updated) {
        setUser({ ...updated, id: updated.id || updated._id });
        // refresh original snapshot and exit edit mode
        const fullName = updated.name || `${profile.firstName} ${profile.lastName}`.trim();
        const [firstName = '', ...rest] = fullName.split(' ');
        const lastName = rest.join(' ');
        const normalized = { firstName: firstName || '', lastName: lastName || '', email: updated.email || '', phone: updated.phone || '' };
        originalProfileRef.current = normalized;
        setProfile(normalized);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      // optionally show UI feedback
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    if (originalProfileRef.current) setProfile(originalProfileRef.current);
    setIsEditing(false);
  };

  const isDirty = () => {
    const o = originalProfileRef.current || {};
    return (
      (profile.firstName || '') !== (o.firstName || '') ||
      (profile.lastName || '') !== (o.lastName || '') ||
      (profile.email || '') !== (o.email || '') ||
      (profile.phone || '') !== (o.phone || '')
    );
  };

  // Addresses state & handlers
  const [addresses, setAddresses] = useState([]);
  const [isAddressEditorOpen, setIsAddressEditorOpen] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addressForm, setAddressForm] = useState({ label: '', name: '', street: '', city: '', state: '', zip: '', country: '', isDefault: false });

  useEffect(() => {
    setAddresses(Array.isArray(user?.addresses) ? user.addresses : []);
  }, [user]);

  const openAddAddress = () => {
    setEditingAddressIndex(null);
    setAddressForm({ label: '', name: '', street: '', city: '', state: '', zip: '', country: '', isDefault: addresses.length === 0 });
    setIsAddressEditorOpen(true);
  };

  const openEditAddress = (idx) => {
    const a = addresses[idx] || { label: '', name: '', street: '', city: '', state: '', zip: '', country: '', isDefault: false };
    setEditingAddressIndex(idx);
    setAddressForm({ ...a });
    setIsAddressEditorOpen(true);
  };

  const removeAddress = async (idx) => {
    if (!window.confirm('Remove this address?')) return;
    const next = addresses.filter((_, i) => i !== idx);
    setAddresses(next);
    try {
      const updated = await authApi.updateMe({ addresses: next });
      if (updated) setUser({ ...updated, id: updated.id || updated._id });
    } catch (err) {
      console.error('Failed to remove address', err);
    }
  };

  const saveAddress = async () => {
    const next = addresses.slice();
    if (editingAddressIndex === null) {
      next.push(addressForm);
    } else {
      next[editingAddressIndex] = addressForm;
    }

    // ensure single default
    if (addressForm.isDefault) {
      for (let i = 0; i < next.length; i++) next[i].isDefault = (i === (editingAddressIndex === null ? next.length - 1 : editingAddressIndex));
    }

    setAddresses(next);
    setIsAddressEditorOpen(false);
    try {
      const updated = await authApi.updateMe({ addresses: next });
      if (updated) setUser({ ...updated, id: updated.id || updated._id });
    } catch (err) {
      console.error('Failed to save address', err);
    }
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard__header">
          <h1 className="dashboard__title">My Account</h1>
          <p className="dashboard__welcome">Welcome back, {profile.firstName}</p>
        </div>

        <div className="dashboard__layout">
          {/* Sidebar */}
          <aside className="dashboard__sidebar">
            <div className="dashboard__avatar">
              <span>{profile.firstName[0]}{profile.lastName[0]}</span>
            </div>
            <p className="dashboard__user-name">{profile.firstName} {profile.lastName}</p>
            <p className="dashboard__user-email">{profile.email}</p>

            <nav className="dashboard__nav">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`dashboard__nav-item ${activeTab === tab.id ? 'dashboard__nav-item--active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                    <FiChevronRight size={14} className="dashboard__nav-arrow" />
                  </button>
                );
              })}
              <button className="dashboard__nav-item dashboard__nav-item--logout" onClick={handleLogout}>
                <FiLogOut size={18} />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Content */}
          <main className="dashboard__content">
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dash-panel">
                <div className="dash-panel__header">
                  <h2>Personal Information</h2>
                  <button className="dash-panel__edit" onClick={() => setIsEditing(true)} disabled={isEditing}>
                    <FiEdit2 size={14} /> Edit
                  </button>
                </div>
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={profile.firstName}
                      readOnly={!isEditing}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      readOnly={!isEditing}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      readOnly={!isEditing}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      readOnly={!isEditing}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ marginTop: '24px' }}>
                  {isEditing ? (
                    <>
                      <button className="btn btn-secondary" onClick={handleCancelEdit} style={{ marginRight: 12 }} disabled={savingProfile}>Cancel</button>
                      <button className="btn btn-primary" onClick={handleSaveProfile} disabled={savingProfile || !isDirty()}>
                        {savingProfile ? 'Saving…' : 'Save Changes'}
                      </button>
                    </>
                  ) : null}
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dash-panel">
                <h2>Order History</h2>
                <div className="orders-list">
                  {orders.map((order) => {
                    const StatusIcon = statusIcons[order.status] || FiClock;
                    return (
                      <div key={order.id} className="order-card">
                        <div className="order-card__header">
                          <div>
                            <span className="order-card__id">{order.id}</span>
                            <span className="order-card__date">{order.date}</span>
                          </div>
                          <div
                            className="order-card__status"
                            style={{ color: statusColors[order.status], borderColor: statusColors[order.status] }}
                          >
                            <StatusIcon size={14} />
                            {order.status}
                          </div>
                        </div>
                        <div className="order-card__items">
                          {order.items.map((item, i) => (
                            <div key={i} className="order-card__item">
                              <img src={item.image} alt={item.name} />
                              <div>
                                <span className="order-card__item-name">{item.name}</span>
                                <span className="order-card__item-meta">Size: {item.size} • Qty: {item.quantity}</span>
                              </div>
                              <span className="order-card__item-price">${item.price}</span>
                            </div>
                          ))}
                        </div>
                        <div className="order-card__footer">
                          <span className="order-card__total">Total: ${order.total.toLocaleString()}</span>
                          {order.status === 'In Transit' && (
                            <div className="order-tracking">
                              <div className="order-tracking__bar">
                                <div className="order-tracking__progress" style={{ width: '66%' }} />
                              </div>
                              <div className="order-tracking__labels">
                                <span>Ordered</span>
                                <span>Shipped</span>
                                <span>Delivered</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dash-panel">
                <div className="dash-panel__header">
                  <h2>Saved Addresses</h2>
                  <button className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.75rem' }} onClick={openAddAddress}>
                    Add New
                  </button>
                </div>

                <div className="address-grid">
                  {addresses.length === 0 ? (
                    <div style={{ padding: 24, color: '#9ca3af' }}>No saved addresses</div>
                  ) : (
                    addresses.map((a, idx) => (
                      <div key={idx} className={`address-card ${a.isDefault ? 'address-card--default' : ''}`}>
                        {a.isDefault && <span className="address-card__badge">Default</span>}
                        <h4>{a.label || 'Address'}</h4>
                        <p>
                          {a.name}<br />{a.street}<br />{a.city}{a.state ? `, ${a.state}` : ''} {a.zip || ''}<br />{a.country}
                        </p>
                        <div className="address-card__actions">
                          <button onClick={() => openEditAddress(idx)}>Edit</button>
                          <button onClick={() => removeAddress(idx)}>Remove</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {isAddressEditorOpen && (
                  <div style={{ marginTop: 18 }} className="address-editor">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <label>
                        Label
                        <input value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} />
                      </label>
                      <label>
                        Name
                        <input value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} />
                      </label>
                      <label style={{ gridColumn: '1 / -1' }}>
                        Street
                        <input value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} />
                      </label>
                      <label>
                        City
                        <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} />
                      </label>
                      <label>
                        State
                        <input value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} />
                      </label>
                      <label>
                        ZIP
                        <input value={addressForm.zip} onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })} />
                      </label>
                      <label>
                        Country
                        <input value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} />
                      </label>
                      <label className="address-default">
                        <input type="checkbox" checked={!!addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} /> Default
                      </label>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <button className="btn btn-secondary" onClick={() => setIsAddressEditorOpen(false)} style={{ marginRight: 8 }}>Cancel</button>
                      <button className="btn btn-primary" onClick={saveAddress}>Save Address</button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dash-panel">
                <h2>My Wishlist</h2>
                {wishlistProducts.length === 0 ? (
                  <div className="dash-panel__empty-state">
                    <FiHeart size={48} />
                    <p>Your wishlist is empty.</p>
                    <Link to="/products" className="btn btn-primary">Browse Collections</Link>
                  </div>
                ) : (
                  <div className="wishlist-grid">
                    {wishlistProducts.map(p => (
                      <div key={p.id} className="wishlist-card">
                        <Link to={`/product/${p.id}`} className="wishlist-card__image-wrap">
                          <img src={p.image} alt={p.name} className="wishlist-card__image" />
                        </Link>
                        <div className="wishlist-card__info">
                          <span className="wishlist-card__brand">{p.brand}</span>
                          <Link to={`/product/${p.id}`} className="wishlist-card__name">{p.name}</Link>
                          <div className="wishlist-card__price-row">
                            <span className="wishlist-card__price">${p.price.toLocaleString()}</span>
                            {p.originalPrice && <span className="wishlist-card__original">${p.originalPrice.toLocaleString()}</span>}
                          </div>
                          <div className="wishlist-card__actions">
                            <button className="btn btn-primary btn-sm" onClick={() => addToCart({ ...p, size: p.sizes[Math.min(2, p.sizes.length - 1)], color: p.colors[0]?.name, quantity: 1 })}>
                              <FiShoppingBag size={14} /> Add to Bag
                            </button>
                            <button className="wishlist-card__remove" onClick={() => toggleWishlist(p.id)} aria-label="Remove from wishlist">
                              <FiX size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
