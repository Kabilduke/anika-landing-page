import { useState } from 'react';
import './ProductSection.css';

// Import your Figma images
import RingHandImg from '../assets/RingHand.webp';
import Product1 from '../assets/Product1.webp';
import Product2 from '../assets/Product2.webp';
import Product3 from '../assets/Product3.webp';
import Product4 from '../assets/Product4.webp';
import Product5 from '../assets/Product2.webp';

export const PRODUCTS = [
  { id: 1, img: Product1, price: '₹1,299', original: '₹2,800', name: 'Glamore Bangles', category: 'Bangles' },
  { id: 2, img: Product2, price: '₹1,199', original: '₹2,500', name: 'Glamore Bangles', category: 'Bangles' },
  { id: 3, img: Product3, price: '₹1,849', original: '₹2,800', name: 'Glamore Bangles', category: 'Bangles' },
  { id: 4, img: Product4, price: '₹1,399', original: '₹2,300', name: 'Glamore Bangles', category: 'Bangles' },
  { id: 5, img: Product5, price: '₹1,249', original: '₹2,500', name: 'Glamore Bangles', category: 'Bangles' },
];

const VISIBLE = 5;

export default function ProductSection({ onProductClick }) {
  const [startIndex, setStartIndex] = useState(0);

  const canPrev = startIndex > 0;
  const canNext = startIndex + VISIBLE < PRODUCTS.length;

  const prev = () => { if (canPrev) setStartIndex(startIndex - 1); };
  const next = () => { if (canNext) setStartIndex(startIndex + 1); };

  const visible = PRODUCTS.slice(startIndex, startIndex + VISIBLE);

  return (
    <section className="product-section">

      {/* Left: hand with ring image */}
      <div className="product-left">
        <img src={RingHandImg} alt="Ring on hand" className="ring-hand-img" loading="lazy" decoding="async" />
        <div className="lifestyle-overlay">
          <p className="lifestyle-subtitle">Wear the Memories </p>
          <h2 className="lifestyle-title">Bangles</h2>
        </div>
      </div>

      {/* Right: product cards */}
      <div className="product-right">
        <div className="product-cards">
          {visible.map((product) => (
            <div 
              key={product.id} 
              className="product-card" 
              onClick={() => onProductClick(product)}
              style={{ cursor: 'pointer' }}
            >

              {/* Product image ONLY */}
              <div className="product-img-wrapper">
                <img src={product.img} alt={product.name} className="product-img" loading="lazy" decoding="async" />
              </div>

              {/* Product Info below the image */}
              <div className="product-details">
                <div className="product-info">
                  <span className="product-price">{product.price}</span>
                  <span className="product-original">{product.original}</span>
                </div>
                <p className="product-name">{product.name}</p>
              </div>

            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="product-footer">
          <div className="carousel-nav">
            <button
              className={`nav-arrow ${!canPrev ? 'disabled' : ''}`}
              onClick={prev}
              aria-label="Previous"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                <path d="M10 4L6 8l4 4" stroke="#333" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className={`nav-arrow ${!canNext ? 'disabled' : ''}`}
              onClick={next}
              aria-label="Next"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                <path d="M6 4l4 4-4 4" stroke="#333" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <button className="shop-now-btn">Shop Now</button>
        </div>
      </div>

    </section>
  );
}