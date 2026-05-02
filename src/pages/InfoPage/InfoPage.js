import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import './InfoPage.css';

export default function InfoPage({ title, eyebrow, intro, sections = [], cta }) {
  return (
    <div className="info-page">
      <div className="info-page__glow info-page__glow--one" />
      <div className="info-page__glow info-page__glow--two" />

      <div className="container info-page__inner">
        <motion.header
          className="info-page__hero"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {eyebrow && <p className="info-page__eyebrow">{eyebrow}</p>}
          <h1 className="info-page__title">{title}</h1>
          <p className="info-page__intro">{intro}</p>
          {cta && (
            <Link to={cta.to} className="btn btn-primary info-page__cta">
              {cta.label}
              <FiArrowRight size={14} />
            </Link>
          )}
        </motion.header>

        <div className="info-page__grid">
          {sections.map((section) => (
            <motion.section
              key={section.title}
              className="info-card"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
            >
              <h2>{section.title}</h2>
              {section.text && <p>{section.text}</p>}
              {Array.isArray(section.items) && section.items.length > 0 && (
                <ul className="info-card__list">
                  {section.items.map((item) => (
                    <li key={item.title || item}>{typeof item === 'string' ? item : (
                      <>
                        <strong>{item.title}</strong>
                        {item.text && <span>{item.text}</span>}
                      </>
                    )}</li>
                  ))}
                </ul>
              )}
            </motion.section>
          ))}
        </div>
      </div>
    </div>
  );
}