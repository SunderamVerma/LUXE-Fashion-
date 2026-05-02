import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiMessageCircle, FiStar, FiShoppingBag } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import './ChatBot.css';

const CONCIERGE_NAME = 'Élise';

const QUICK_REPLIES = [
  'Show me trending pieces',
  'Recommend a dress',
  'Best bags under $1000',
  'Men\'s suits',
  'What\'s on sale?',
  'Beauty picks',
];

// ── Product search engine ──────────────────────────────────────────────────
function searchProducts(products, query, limit = 4) {
  const lower = query.toLowerCase();
  const tokens = lower.split(/\s+/).filter(t => t.length > 2);

  const scored = products.map(p => {
    let score = 0;
    const haystack = `${p.name} ${p.brand} ${p.category} ${p.subcategory} ${p.description} ${p.colors.map(c => c.name).join(' ')}`.toLowerCase();

    tokens.forEach(token => {
      if (p.name.toLowerCase().includes(token)) score += 10;
      if (p.subcategory.includes(token)) score += 8;
      if (p.category.includes(token)) score += 6;
      if (p.brand.toLowerCase().includes(token)) score += 4;
      if (p.description.toLowerCase().includes(token)) score += 2;
      if (haystack.includes(token)) score += 1;
    });

    // Bonus for specific intents
    if (lower.includes('trending') && p.isTrending) score += 15;
    if (lower.includes('new') && p.isNew) score += 15;
    if ((lower.includes('sale') || lower.includes('discount') || lower.includes('offer')) && p.originalPrice) score += 15;
    if (lower.includes('top rated') || lower.includes('best')) score += p.rating * 2;

    // Price intent
    const priceMatch = lower.match(/under\s*\$?(\d+)/);
    if (priceMatch) {
      const maxPrice = parseInt(priceMatch[1], 10);
      if (p.price <= maxPrice) score += 12;
      else score -= 20;
    }
    const aboveMatch = lower.match(/(?:above|over)\s*\$?(\d+)/);
    if (aboveMatch) {
      const minPrice = parseInt(aboveMatch[1], 10);
      if (p.price >= minPrice) score += 12;
      else score -= 20;
    }

    return { product: p, score };
  }).filter(s => s.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.product);
}

// ── Intent detection & response generation ─────────────────────────────────
function generateResponse(products, message) {
  const lower = message.toLowerCase().trim();

  // Greeting
  if (/^(hi|hey|hello|hola|good\s*(morning|afternoon|evening))/.test(lower)) {
    return { text: `Hello, darling! So lovely to have you here. I'm ${CONCIERGE_NAME}, your personal style concierge. Tell me what you're looking for and I'll find the perfect pieces for you.`, products: [] };
  }

  // Thanks
  if (/thank|thanks|thx/.test(lower)) {
    return { text: "You're most welcome, darling. That's what I'm here for. Need anything else? Just say the word.", products: [] };
  }

  // Shipping
  if (/shipping|deliver|return|refund|exchange/.test(lower)) {
    return { text: "We offer complimentary express shipping on orders over $500 — delivered in a signature LUXÉ gift box, naturally. Returns are accepted within 30 days, and we'll arrange a courier pickup at your convenience. All items must be in their original condition with tags attached.", products: [] };
  }

  // Track order
  if (/track|order\s*status|where.*(order|package)/.test(lower)) {
    return { text: "You can view your order status and tracking details anytime from your Dashboard under \"My Orders.\" Each order shows real-time tracking with our courier partners.", products: [] };
  }

  // Size help
  if (/size|sizing|fit|measure/.test(lower)) {
    return { text: "Our pieces follow European sizing. Each product page has a detailed size guide. If you're between sizes, I'd suggest going up — our complimentary tailoring service can always adjust for a perfect fit.", products: [] };
  }

  // Gift
  if (/gift|present|birthday|anniversary/.test(lower)) {
    const gifts = searchProducts(products, 'top rated accessories jewelry bags', 4);
    return { text: "How thoughtful! Here are our most beloved gift picks — each arrives in our signature LUXÉ gift box with a handwritten note:", products: gifts };
  }

  // Trending
  if (/trend|popular|hot|everyone|what.*wearing/.test(lower)) {
    const trending = searchProducts(products, 'trending', 4);
    return { text: "Here's what our most stylish clients are wearing right now. These are flying off the shelves, darling:", products: trending };
  }

  // New arrivals
  if (/new\s*arrival|just\s*in|latest|newest/.test(lower)) {
    const newItems = searchProducts(products, 'new arrivals', 4);
    return { text: "Fresh from the atelier — our latest arrivals, handpicked just for you:", products: newItems };
  }

  // Sale / discount
  if (/sale|discount|offer|deal|bargain|cheap|affordable|budget/.test(lower)) {
    const saleItems = searchProducts(products, 'sale discount', 4);
    return { text: "Excellent taste and savvy shopping? I love it. Here are our best deals right now:", products: saleItems };
  }

  // Category/subcategory searches
  const categoryKeywords = ['dress', 'blazer', 'skirt', 'top', 'pant', 'coat', 'knit', 'sweater', 'swim', 'jumpsuit', 'suit', 'shirt', 'jacket', 'shoe', 'sneaker', 'boot', 'heel', 'sandal', 'loafer', 'oxford', 'bag', 'jewelry', 'necklace', 'bracelet', 'ring', 'earring', 'watch', 'sunglasses', 'eyewear', 'scarf', 'belt', 'hat', 'wallet', 'fragrance', 'perfume', 'skincare', 'serum', 'cream', 'makeup', 'lipstick', 'foundation', 'shampoo', 'haircare', 'polo', 'short', 'activewear', 'legging'];

  for (const keyword of categoryKeywords) {
    if (lower.includes(keyword)) {
      const results = searchProducts(products, message, 4);
      if (results.length > 0) {
        return { text: `I've curated these especially for you — each one a standout piece:`, products: results };
      }
    }
  }

  // Generic product search — try matching any meaningful query
  const results = searchProducts(products, message, 4);
  if (results.length > 0) {
    return { text: `Here's what I found for you, darling. Each piece has been selected with the utmost care:`, products: results };
  }

  // Women / Men / Accessories general
  if (/women|woman|her|ladies/.test(lower)) {
    const results = searchProducts(products, 'women dresses tops blazers trending', 4);
    return { text: "For the sophisticated woman — here are some of our most coveted pieces:", products: results };
  }
  if (/\bmen\b|man|\bhim\b|guys/.test(lower)) {
    const results = searchProducts(products, 'men suits jackets shirts trending', 4);
    return { text: "For the distinguished gentleman — a selection of our finest:", products: results };
  }
  if (/accessor/.test(lower)) {
    const results = searchProducts(products, 'accessories bags jewelry watches', 4);
    return { text: "The details make the outfit. Here are our most sought-after accessories:", products: results };
  }
  if (/beauty|skincare|makeup|fragrance/.test(lower)) {
    const results = searchProducts(products, 'beauty fragrance skincare makeup', 4);
    return { text: "Indulge in our luxury beauty collection — because you deserve nothing less:", products: results };
  }

  // Fallback
  return { text: `I'd love to help with that! Try asking me for specific items like "show me leather bags" or "best dresses under $2000" and I'll curate the perfect selection for you.`, products: [] };
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: `Welcome to LUXÉ, darling. I'm ${CONCIERGE_NAME}, your personal style concierge. Ask me anything — "show me trending bags," "dresses under $1500," or "best gifts for her" — and I'll curate the perfect selection.`, products: [], time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { addToCart, products } = useApp();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now(), from: 'user', text: text.trim(), products: [], time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const response = generateResponse(products, text);
      const botMsg = { id: Date.now() + 1, from: 'bot', text: response.text, products: response.products, time: new Date() };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      size: product.sizes[Math.min(2, product.sizes.length - 1)],
      color: product.colors[0]?.name,
      quantity: 1,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Chat with personal concierge"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <FiX size={22} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <FiMessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
        {!isOpen && <span className="chatbot-fab__pulse" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className="chatbot__header">
              <div className="chatbot__avatar">
                <span>É</span>
                <span className="chatbot__status" />
              </div>
              <div className="chatbot__header-info">
                <h4 className="chatbot__name">{CONCIERGE_NAME}</h4>
                <p className="chatbot__role">Personal Style Concierge</p>
              </div>
              <button className="chatbot__close" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <FiX size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="chatbot__messages">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`chatbot__msg chatbot__msg--${msg.from}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="chatbot__msg-text">{msg.text}</p>

                  {/* Product recommendations */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="chatbot__products">
                      {msg.products.map((p) => (
                        <div key={p.id} className="chatbot__product-card">
                          <Link to={`/product/${p.id}`} className="chatbot__product-link" onClick={() => setIsOpen(false)}>
                            <img src={p.image} alt={p.name} className="chatbot__product-img" loading="lazy" />
                            <div className="chatbot__product-info">
                              <span className="chatbot__product-brand">{p.brand}</span>
                              <span className="chatbot__product-name">{p.name}</span>
                              <div className="chatbot__product-meta">
                                <span className="chatbot__product-price">${p.price.toLocaleString()}</span>
                                {p.originalPrice && (
                                  <span className="chatbot__product-original">${p.originalPrice.toLocaleString()}</span>
                                )}
                                <span className="chatbot__product-rating"><FiStar size={10} /> {p.rating}</span>
                              </div>
                            </div>
                          </Link>
                          <button
                            className="chatbot__product-cart-btn"
                            onClick={() => handleAddToCart(p)}
                            aria-label={`Add ${p.name} to bag`}
                          >
                            <FiShoppingBag size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="chatbot__msg-time">{formatTime(msg.time)}</span>
                </motion.div>
              ))}

              {isTyping && (
                <div className="chatbot__msg chatbot__msg--bot">
                  <div className="chatbot__typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="chatbot__quick-replies">
                {QUICK_REPLIES.map((text) => (
                  <button
                    key={text}
                    className="chatbot__quick-btn"
                    onClick={() => sendMessage(text)}
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form className="chatbot__input-area" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                className="chatbot__input"
                placeholder="Ask your concierge..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
              />
              <button type="submit" className="chatbot__send" disabled={!input.trim()} aria-label="Send message">
                <FiSend size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
