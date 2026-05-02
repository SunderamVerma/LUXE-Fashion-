import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiCreditCard, FiSmartphone, FiDollarSign, FiLock } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { SHIPPING, TAX_RATE } from '../../constants/appConstants';
import { addressSchema, cardPaymentSchema, upiPaymentSchema, validate } from '../../utils/validators';
import './Checkout.css';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: FiCreditCard },
  { id: 'upi', label: 'UPI Payment', icon: FiSmartphone },
  { id: 'cod', label: 'Cash on Delivery', icon: FiDollarSign },
];

const CHECKOUT_STORAGE_KEY = 'luxe-fashion-checkout';

function readStoredCheckout() {
  if (typeof window === 'undefined') return null;

  try {
    const rawValue = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

export default function Checkout() {
  const { cart, cartTotal, placeOrder } = useApp();
  const navigate = useNavigate();
  const storedCheckout = readStoredCheckout();
  const [step, setStep] = useState(storedCheckout?.step || 1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(storedCheckout?.paymentMethod || 'card');
  const [errors, setErrors] = useState({});

  const [address, setAddress] = useState(storedCheckout?.address || {
    firstName: '', lastName: '', email: '', phone: '',
    street: '', city: '', state: '', zip: '', country: '',
  });
  const [paymentDetails, setPaymentDetails] = useState(storedCheckout?.paymentDetails || {
    cardNumber: '',
    expiry: '',
    cvv: '',
    nameOnCard: '',
    upiId: '',
  });

  const shipping = cartTotal > SHIPPING.FREE_THRESHOLD ? 0 : SHIPPING.STANDARD_FEE;
  const tax = Math.round(cartTotal * TAX_RATE);
  const total = cartTotal + shipping + tax;

  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) {
      navigate('/cart');
    }
  }, [cart.length, navigate, orderPlaced]);

  useEffect(() => {
    if (typeof window === 'undefined' || orderPlaced) return;

    window.localStorage.setItem(
      CHECKOUT_STORAGE_KEY,
      JSON.stringify({
        step,
        paymentMethod,
        address,
        paymentDetails,
      })
    );
  }, [address, orderPlaced, paymentDetails, paymentMethod, step]);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setErrors((currentErrors) => ({ ...currentErrors, [e.target.name]: '' }));
  };

  const handlePaymentDetailsChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
    setErrors((currentErrors) => ({ ...currentErrors, [e.target.name]: '' }));
  };

  const validateAddress = async () => {
    const result = await validate(addressSchema, address);
    setErrors(result.errors);
    return result.success;
  };

  const validatePayment = async () => {
    if (paymentMethod === 'cod') {
      return true;
    }

    if (paymentMethod === 'card') {
      const result = await validate(cardPaymentSchema, {
        ...paymentDetails,
        cardNumber: paymentDetails.cardNumber.replace(/\s/g, ''),
      });
      setErrors(result.errors);
      return result.success;
    }

    const result = await validate(upiPaymentSchema, { upiId: paymentDetails.upiId });
    setErrors(result.errors);
    return result.success;
  };

  const handleContinueToPayment = async () => {
    if (await validateAddress()) {
      setStep(2);
    }
  };

  const handleReviewOrder = async () => {
    if (await validatePayment()) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    const addressIsValid = await validateAddress();
    const paymentIsValid = await validatePayment();
    if (!addressIsValid || !paymentIsValid) {
      return;
    }

    await placeOrder({
      customerName: `${address.firstName} ${address.lastName}`.trim(),
      subtotal: cartTotal,
      shipping,
      tax,
      total,
      address,
      paymentMethod,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        color: item.color,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        image: item.image,
      })),
    });

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
    }

    setOrderPlaced(true);
  };

  if (cart.length === 0 && !orderPlaced) {
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="checkout-success">
        <div className="container">
          <motion.div
            className="checkout-success__inner"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="checkout-success__icon">
              <FiCheck size={40} />
            </div>
            <h2 className="checkout-success__title">Order Confirmed</h2>
            <p className="checkout-success__text">
              Thank you for your order. You will receive a confirmation email shortly.
            </p>
            <div className="checkout-success__actions">
              <Link to="/dashboard" className="btn btn-primary">View Orders</Link>
              <Link to="/products" className="btn btn-secondary">Continue Shopping</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="container">
        <h1 className="checkout__title">Checkout</h1>

        {/* Steps */}
        <div className="checkout-steps">
          {['Address', 'Payment', 'Review'].map((s, i) => (
            <div key={s} className={`checkout-step ${step > i + 1 ? 'checkout-step--done' : ''} ${step === i + 1 ? 'checkout-step--active' : ''}`}>
              <div className="checkout-step__number">
                {step > i + 1 ? <FiCheck size={14} /> : i + 1}
              </div>
              <span className="checkout-step__label">{s}</span>
            </div>
          ))}
        </div>

        <div className="checkout__layout">
          {/* Form Area */}
          <div className="checkout__form">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="checkout__section-title">Shipping Address</h2>
                <div className="checkout__grid">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" name="firstName" value={address.firstName} onChange={handleAddressChange} placeholder="First name" />
                    {errors.firstName && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.firstName}</p>}
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" name="lastName" value={address.lastName} onChange={handleAddressChange} placeholder="Last name" />
                    {errors.lastName && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.lastName}</p>}
                  </div>
                  <div className="form-group form-group--full">
                    <label>Email</label>
                    <input type="email" name="email" value={address.email} onChange={handleAddressChange} placeholder="Email address" />
                    {errors.email && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.email}</p>}
                  </div>
                  <div className="form-group form-group--full">
                    <label>Phone</label>
                    <input type="tel" name="phone" value={address.phone} onChange={handleAddressChange} placeholder="Phone number" />
                    {errors.phone && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.phone}</p>}
                  </div>
                  <div className="form-group form-group--full">
                    <label>Street Address</label>
                    <input type="text" name="street" value={address.street} onChange={handleAddressChange} placeholder="Street address" />
                    {errors.street && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.street}</p>}
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" name="city" value={address.city} onChange={handleAddressChange} placeholder="City" />
                    {errors.city && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.city}</p>}
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input type="text" name="state" value={address.state} onChange={handleAddressChange} placeholder="State" />
                    {errors.state && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.state}</p>}
                  </div>
                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input type="text" name="zip" value={address.zip} onChange={handleAddressChange} placeholder="ZIP" />
                    {errors.zip && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.zip}</p>}
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input type="text" name="country" value={address.country} onChange={handleAddressChange} placeholder="Country" />
                    {errors.country && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.country}</p>}
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleContinueToPayment}>
                  Continue to Payment
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="checkout__section-title">Payment Method</h2>
                <div className="payment-methods">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <label key={method.id} className={`payment-method ${paymentMethod === method.id ? 'payment-method--active' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <div className="payment-method__radio" />
                        <Icon size={20} />
                        <span>{method.label}</span>
                      </label>
                    );
                  })}
                </div>

                {paymentMethod === 'card' && (
                  <div className="card-form">
                    <div className="form-group form-group--full">
                      <label>Card Number</label>
                      <input type="text" name="cardNumber" value={paymentDetails.cardNumber} onChange={handlePaymentDetailsChange} placeholder="1234 5678 9012 3456" maxLength="19" />
                      {errors.cardNumber && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.cardNumber}</p>}
                    </div>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input type="text" name="expiry" value={paymentDetails.expiry} onChange={handlePaymentDetailsChange} placeholder="MM/YY" maxLength="5" />
                      {errors.expiry && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.expiry}</p>}
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input type="text" name="cvv" value={paymentDetails.cvv} onChange={handlePaymentDetailsChange} placeholder="123" maxLength="4" />
                      {errors.cvv && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.cvv}</p>}
                    </div>
                    <div className="form-group form-group--full">
                      <label>Name on Card</label>
                      <input type="text" name="nameOnCard" value={paymentDetails.nameOnCard} onChange={handlePaymentDetailsChange} placeholder="Full name" />
                      {errors.nameOnCard && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.nameOnCard}</p>}
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="card-form">
                    <div className="form-group form-group--full">
                      <label>UPI ID</label>
                      <input type="text" name="upiId" value={paymentDetails.upiId} onChange={handlePaymentDetailsChange} placeholder="yourname@upi" />
                      {errors.upiId && <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '6px' }}>{errors.upiId}</p>}
                    </div>
                  </div>
                )}

                <div className="checkout__nav">
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn-primary" onClick={handleReviewOrder}>Review Order</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="checkout__section-title">Review Your Order</h2>

                <div className="review-section">
                  <h4>Shipping Address</h4>
                  <p>{address.firstName} {address.lastName}</p>
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} {address.zip}</p>
                  <p>{address.country}</p>
                </div>

                <div className="review-section">
                  <h4>Payment</h4>
                  <p>{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}</p>
                  {paymentMethod === 'card' && paymentDetails.cardNumber && (
                    <p>Ending in {paymentDetails.cardNumber.replace(/\s/g, '').slice(-4)}</p>
                  )}
                  {paymentMethod === 'upi' && paymentDetails.upiId && (
                    <p>{paymentDetails.upiId}</p>
                  )}
                </div>

                <div className="review-section">
                  <h4>Items ({cart.length})</h4>
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="review-item">
                      <img src={item.image} alt={item.name} className="review-item__image" />
                      <div className="review-item__info">
                        <span className="review-item__name">{item.name}</span>
                        <span className="review-item__meta">{item.size} • Qty: {item.quantity}</span>
                      </div>
                      <span className="review-item__price">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="checkout__nav">
                  <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
                  <button className="btn btn-gold" onClick={handlePlaceOrder}>
                    <FiLock size={14} /> Place Order — ${total.toLocaleString()}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="checkout-sidebar">
            <div className="checkout-sidebar__inner">
              <h3 className="checkout-sidebar__title">Order Summary</h3>
              <div className="checkout-sidebar__items">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="checkout-sidebar__item">
                    <div className="checkout-sidebar__item-image">
                      <img src={item.image} alt={item.name} />
                      <span className="checkout-sidebar__item-qty">{item.quantity}</span>
                    </div>
                    <div className="checkout-sidebar__item-info">
                      <span>{item.name}</span>
                      <span className="checkout-sidebar__item-meta">{item.size}</span>
                    </div>
                    <span>${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="checkout-sidebar__totals">
                <div className="checkout-sidebar__row">
                  <span>Subtotal</span><span>${cartTotal.toLocaleString()}</span>
                </div>
                <div className="checkout-sidebar__row">
                  <span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                </div>
                <div className="checkout-sidebar__row">
                  <span>Tax</span><span>${tax.toLocaleString()}</span>
                </div>
                <div className="checkout-sidebar__row checkout-sidebar__row--total">
                  <span>Total</span><span>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
