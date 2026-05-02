import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ChatBot from './components/ChatBot/ChatBot';

import Home from './pages/Home/Home';
import ProductListing from './pages/ProductListing/ProductListing';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Dashboard from './pages/Dashboard/Dashboard';
import Auth from './pages/Auth/Auth';
import Admin from './pages/Admin/Admin';
import Wishlist from './pages/Wishlist/Wishlist';
import InfoPage from './pages/InfoPage/InfoPage';

const infoPages = [
  {
    path: '/about',
    eyebrow: 'About LUXÉ',
    title: 'Luxury, designed for everyday ritual.',
    intro: 'LUXÉ blends timeless tailoring with modern ease, creating elevated essentials, statement pieces, and a refined shopping experience.',
    sections: [
      {
        title: 'Our approach',
        text: 'We focus on premium fabrics, clean construction, and versatile silhouettes that move from day to evening with ease.',
      },
      {
        title: 'What we value',
        items: ['Considered design', 'Responsible sourcing', 'Lasting quality', 'Exceptional service'],
      },
    ],
  },
  {
    path: '/careers',
    eyebrow: 'Careers',
    title: 'Build the next chapter of modern luxury.',
    intro: 'Join a team focused on design, craftsmanship, and digital retail experiences that feel premium from the first click to final delivery.',
    sections: [
      {
        title: 'Open roles',
        items: [
          { title: 'Retail experience', text: 'Client advisors and brand specialists.' },
          { title: 'Creative studio', text: 'Styling, content, and visual direction.' },
          { title: 'Product operations', text: 'Merchandising, fulfillment, and catalog management.' },
        ],
      },
      {
        title: 'How to apply',
        text: 'Send your portfolio and a short introduction to careers@luxe.com. We review every application carefully.',
      },
    ],
  },
  {
    path: '/sustainability',
    eyebrow: 'Sustainability',
    title: 'Thoughtful choices, made to last.',
    intro: 'We are building a more responsible luxury wardrobe through durable materials, mindful packaging, and fewer, better pieces.',
    sections: [
      {
        title: 'Our commitments',
        items: ['Durable product construction', 'Reduced packaging waste', 'Longer product life cycles', 'Transparent supplier standards'],
      },
      {
        title: 'Looking ahead',
        text: 'We continue to expand lower-impact materials and improve our operations across the supply chain.',
      },
    ],
  },
  {
    path: '/press',
    eyebrow: 'Press',
    title: 'For editorial features and brand stories.',
    intro: 'Need brand assets, product imagery, or a statement for coverage? Our press team can help with story ideas and materials.',
    sections: [
      {
        title: 'Media contact',
        text: 'Press inquiries: press@luxe.com',
      },
      {
        title: 'Resources',
        items: ['Logo files', 'Campaign imagery', 'Product lookbooks', 'Collection notes'],
      },
    ],
  },
  {
    path: '/stores',
    eyebrow: 'Stores',
    title: 'Visit us in person.',
    intro: 'Experience LUXÉ in curated spaces designed for styling appointments, product discovery, and personalized service.',
    sections: [
      {
        title: 'Flagship locations',
        items: [
          { title: 'New York', text: 'SoHo, 108 Mercer Street' },
          { title: 'London', text: 'Mayfair, 21 Mount Street' },
          { title: 'Dubai', text: 'DIFC, Gate Avenue' },
        ],
      },
      {
        title: 'Appointments',
        text: 'Book a private styling session by emailing stores@luxe.com.',
      },
    ],
  },
  {
    path: '/contact',
    eyebrow: 'Contact Us',
    title: 'We are here to help.',
    intro: 'For order support, styling questions, or general assistance, our client care team will direct your request to the right place.',
    sections: [
      {
        title: 'Reach us',
        items: [
          { title: 'Email', text: 'support@luxe.com' },
          { title: 'Phone', text: '+1 (800) 555-0199' },
          { title: 'Hours', text: 'Mon-Fri, 9:00 AM to 6:00 PM' },
        ],
      },
      {
        title: 'Need order help?',
        text: 'Include your order number and email address so we can resolve your request faster.',
      },
    ],
  },
  {
    path: '/shipping',
    eyebrow: 'Shipping',
    title: 'Delivery, handled with care.',
    intro: 'We offer complimentary shipping on qualifying orders and careful packaging so your pieces arrive ready to wear.',
    sections: [
      {
        title: 'Shipping options',
        items: [
          { title: 'Standard', text: '3 to 5 business days' },
          { title: 'Express', text: '1 to 2 business days' },
          { title: 'Complimentary', text: 'On orders above the free-shipping threshold' },
        ],
      },
      {
        title: 'Tracking',
        text: 'You will receive a tracking email when your order leaves our fulfillment center.',
      },
    ],
  },
  {
    path: '/returns',
    eyebrow: 'Returns',
    title: 'A calm, simple return process.',
    intro: 'If something is not quite right, we make returns straightforward with a clear window and easy pickup options.',
    sections: [
      {
        title: 'Return window',
        text: 'Items may be returned within 30 days of delivery if they are unworn, unwashed, and in original condition.',
      },
      {
        title: 'How it works',
        items: ['Start a return from your account', 'Pack items with original tags', 'Schedule pickup or drop-off'],
      },
    ],
  },
  {
    path: '/size-guide',
    eyebrow: 'Size Guide',
    title: 'Find the fit that feels right.',
    intro: 'Our pieces are designed with a tailored fit profile. Use these guidelines to choose the size that best matches your measurements.',
    sections: [
      {
        title: 'Fit guidance',
        items: [
          { title: 'Dresses', text: 'True to size with a tailored waist.' },
          { title: 'Outerwear', text: 'Choose your usual size for layering.' },
          { title: 'Knitwear', text: 'Relaxed and softly structured.' },
        ],
      },
      {
        title: 'Need a second opinion?',
        text: 'Our client care team can help with garment measurements and styling advice.',
      },
    ],
  },
  {
    path: '/faqs',
    eyebrow: 'FAQs',
    title: 'Frequently asked questions.',
    intro: 'A quick place to find answers about orders, accounts, payments, and product care.',
    sections: [
      {
        title: 'Common topics',
        items: [
          { title: 'Orders', text: 'Track, modify, or cancel before dispatch.' },
          { title: 'Payments', text: 'We accept major cards and secure checkout methods.' },
          { title: 'Product care', text: 'Follow the label instructions for best results.' },
        ],
      },
      {
        title: 'Still need help?',
        text: 'Use the Contact Us page or the chat assistant for a faster response.',
      },
    ],
  },
  {
    path: '/privacy-policy',
    eyebrow: 'Privacy Policy',
    title: 'How we handle your information.',
    intro: 'We collect only the data needed to process orders, maintain accounts, and improve the shopping experience.',
    sections: [
      {
        title: 'Data use',
        items: ['Order processing', 'Account management', 'Service communication', 'Analytics and site improvement'],
      },
      {
        title: 'Your control',
        text: 'You can request access, correction, or deletion where permitted by law.',
      },
    ],
  },
  {
    path: '/terms',
    eyebrow: 'Terms of Service',
    title: 'The terms that guide the experience.',
    intro: 'These terms cover browsing, account use, purchases, and the responsibilities of both LUXÉ and our customers.',
    sections: [
      {
        title: 'Highlights',
        items: ['Use the site lawfully', 'Keep account details accurate', 'Review product details before purchase'],
      },
      {
        title: 'Questions about the terms?',
        text: 'Contact support@luxe.com if you need clarification before placing an order.',
      },
    ],
  },
  {
    path: '/cookie-policy',
    eyebrow: 'Cookie Policy',
    title: 'Cookies help the site feel seamless.',
    intro: 'We use cookies for essential site functions, shopping bag persistence, and to understand how the experience is used.',
    sections: [
      {
        title: 'Cookie categories',
        items: ['Essential site cookies', 'Analytics cookies', 'Preference cookies'],
      },
      {
        title: 'Managing cookies',
        text: 'You can control cookies through your browser settings at any time.',
      },
    ],
  },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <ErrorBoundary>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/products" element={<PageWrapper><ProductListing /></PageWrapper>} />
          <Route path="/product/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
          <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
          <Route path="/wishlist" element={<PageWrapper><Wishlist /></PageWrapper>} />
          <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
          <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
          <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
          {infoPages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={(
                <PageWrapper>
                  <InfoPage {...page} />
                </PageWrapper>
              )}
            />
          ))}
        </Routes>
      </AnimatePresence>
      {!isAdmin && <Footer />}
      {!isAdmin && <ChatBot />}
    </ErrorBoundary>
  );
}
