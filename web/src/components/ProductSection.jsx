import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductSection.css';
import RingHandImg from '../assets/RingHand.webp';
import { supabase } from '../lib/supabase';


const VISIBLE = 5;

export default function ProductSection({ onProductClick }) {
  const [startIndex, setStartIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          product_id,
          name,
          price,
          compare_price,
          discount_price,
          images,
          categories!inner(name)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .eq('categories.name', 'Bangles')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching Bangles for ProductSection:', error);
        setProducts([]);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map(p => ({
        id: p.product_id,
        img: p.images?.[0] || '',
        name: p.name,
        category: p.categories?.name || '',
        price: p.discount_price
          ? `₹${Number(p.price - p.discount_price).toLocaleString('en-IN')}`
          : `₹${Number(p.price).toLocaleString('en-IN')}`,
        original: p.compare_price
          ? `₹${Number(p.compare_price).toLocaleString('en-IN')}`
          : '',
      }));

      setProducts(mapped);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const canPrev = startIndex > 0;
  const canNext = startIndex + VISIBLE < products.length;

  const prev = () => { if (canPrev) setStartIndex(i => i - 1); };
  const next = () => { if (canNext) setStartIndex(i => i + 1); };

  const visible = products.slice(startIndex, startIndex + VISIBLE);

  if (loading) return (
    <section className="product-section">
      <div className="product-left">
        <img src={RingHandImg} alt="Ring on hand" className="ring-hand-img" loading="lazy" />
        <div className="lifestyle-overlay">
          <p className="lifestyle-subtitle">Wear the Memories</p>
          <h2 className="lifestyle-title">Bangles</h2>
        </div>
      </div>
      <div className="product-right">
        <div className="product-cards">
          {Array.from({ length: VISIBLE }).map((_, i) => (
            <div key={i} className="product-card">
              <div className="product-img-wrapper" style={{ background: '#f5f5f5', borderRadius: 8 }} />
              <div className="product-details">
                <div style={{ height: 12, width: 60, background: '#eee', borderRadius: 4, margin: '8px 0 4px' }} />
                <div style={{ height: 10, width: 90, background: '#f0f0f0', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <section className="product-section">
      <div className="product-left">
        <img src={RingHandImg} alt="Ring on hand" className="ring-hand-img" loading="lazy" decoding="async" />
        <div className="lifestyle-overlay">
          <p className="lifestyle-subtitle">Wear the Memories</p>
          <h2 className="lifestyle-title">Bangles</h2>
        </div>
      </div>

      <div className="product-right">
        <div className="product-cards">
          {visible.map((product) => (
            <div
              key={product.id}
              className="product-card"
              onClick={() => onProductClick(product)}
              style={{ cursor: 'pointer' }}
            >
              <div className="product-img-wrapper">
                <img src={product.img} alt={product.name} className="product-img" loading="lazy" decoding="async" />
              </div>
              <div className="product-details">
                <div className="product-info">
                  <span className="product-price">{product.price}</span>
                  {product.original && <span className="product-original">{product.original}</span>}
                </div>
                <p className="product-name">{product.name}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="product-footer">
          <div className="carousel-nav">
            <button className={`nav-arrow ${!canPrev ? 'disabled' : ''}`} onClick={prev} aria-label="Previous">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                <path d="M10 4L6 8l4 4" stroke="#333" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button className={`nav-arrow ${!canNext ? 'disabled' : ''}`} onClick={next} aria-label="Next">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                <path d="M6 4l4 4-4 4" stroke="#333" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <button className="shop-now-btn" onClick={() => navigate('/bangles')}>Shop Now</button>
        </div>
      </div>
    </section>
  );
}