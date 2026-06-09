import React, { useState, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { useNavigate } from "react-router-dom";
import './ProductDetails.css';
import SiteHeader from './SiteHeader';
import { useStore } from '../hooks/useStore';

// ── Optimized Lazy Loading for heavy components ──────────────────────────────
const SiteFooter = lazy(() => import('./SiteFooter'));
const CategorySection = lazy(() => import('./CategorySection'));

// Main gallery images
import MainBangle from '../assets/Product1.webp';

import PayPalIcon from '../assets/PaymentPal.webp';
import GPayIcon from '../assets/PaymentGPay.webp';
import RazorIcon from '../assets/PaymentRazor.webp';

// ── Loading Skeleton (Placeholder for better perceived speed) ─────────────────
const LoadingSkeleton = ({ height = '200px' }) => (
  <div className="pp-skeleton" style={{ height, background: '#f5f5f5', borderRadius: '8px', margin: '16px 0' }}>
    <div className="pp-skeleton-shimmer" />
  </div>
);

import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';

// ── Icon helpers (memoized) ──────────────────────────────────────────────────
const FacebookIcon = memo(() => (
  <FaFacebookF size={14} aria-hidden="true" />
));

const InstagramIcon = memo(() => (
  <FaInstagram size={16} aria-hidden="true" />
));

const WhatsappIcon = memo(() => (
  <FaWhatsapp size={16} aria-hidden="true" />
));

// ── Memoized sub-components ──────────────────────────────────────────────────

const ProductGallery = memo(({ activeThumb, setActiveThumb, displayImage, displayName, thumbs }) => (
  <div className="pp-gallery">
    <div className="pp-thumbs-col">
      {thumbs.map((item, i) => (
        <button
          key={item.id}
          className={`pp-thumb ${activeThumb === i ? 'active' : ''}`}
          onClick={() => setActiveThumb(i)}
          aria-label={`View ${item.alt}`}
        >
          <img src={item.img} alt={item.alt} loading="lazy" decoding="async" />
        </button>
      ))}
    </div>
    <div className="pp-main-wrap">
      <div className="pp-main-badge">25% Off</div>
      <img
        src={activeThumb === -1 ? displayImage : thumbs[activeThumb].img}
        alt={displayName}
        className="pp-main-img"
        loading="eager"
        decoding="sync"
      />
    </div>
  </div>
));

const RelatedProducts = memo(({ showAll, setShowAll, relatedItems, onProductClick }) => {
  const visibleRelated = showAll ? relatedItems : relatedItems.slice(0, 4);
  return (
    <section className="pp-related">
      <h2 className="pp-related-h2">You May Also Like</h2>
      <div className="pp-related-grid">
        {visibleRelated.map(p => (
          <div
            key={p.id}
            className="pp-rel-card"
            onClick={() => onProductClick && onProductClick(p)}
            style={{ cursor: 'pointer' }}
          >
            <div className="pp-rel-img-wrap">
              <span className="pp-rel-badge">{p.badge}</span>
              <img src={p.img} alt={p.name} className="pp-rel-img" loading="lazy" decoding="async" />
            </div>
            <div className="pp-rel-info">
              <p className="pp-rel-name">{p.name}</p>
              <p className="pp-rel-sub">{p.sub}</p>
              <div className="pp-rel-prices">
                <span className="pp-rel-price">{p.price}</span>
                <span className="pp-rel-orig">{p.original}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pp-show-wrap">
        <button className="pp-show-btn" onClick={() => setShowAll(s => !s)}>
          {showAll ? 'Show Less' : 'Show More'}
        </button>
      </div>
    </section>
  );
});

import { PRODUCTS } from './ProductSection';
import { OFFER_PRODUCTS } from './Offers';

// ═════════════════════════════════════════════════════════════════════════════
export default function ProductPage({ onBack, product, onProductSelect }) {
  const [activeThumb, setActiveThumb] = useState(-1);
  const [qty, setQty] = useState(1);
  const [descOpen, setDescOpen] = useState(false);
  const [addlOpen, setAddlOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Zustand Store
  const addToCart = useStore(state => state.addToCart);
  const toggleWishlist = useStore(state => state.toggleWishlist);
  const wishlistItems = useStore(state => state.wishlistItems);

  const isWishlisted = useMemo(() => {
    const currentId = product?.productId || product?.id;
    return wishlistItems.some(w => w.id === currentId);
  }, [wishlistItems, product]);

  // Determine which image to show in gallery
  const displayImage = product?.img || MainBangle;
  const displayName = product?.name || 'Antique Bangle set';
  const displayPrice = product?.price || '₹1,299.00';
  const displayOriginal = product?.original || '₹2,800.00';

  const navigate = useNavigate();

  // Generate dynamic thumbnails based on the selected product
  const dynamicThumbs = useMemo(() => Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    img: displayImage,
    alt: `${displayName} view ${i + 1}`
  })), [displayImage, displayName]);

  const cat = product?.category || 'Bangles';

  // Dynamic Related Items from Catalog
  const dynamicRelated = useMemo(() => {
    // Determine which catalog to use
    const catalog = cat === 'Bangles' ? PRODUCTS : OFFER_PRODUCTS;

    // Filter out the current product by ID (if available) or by image
    const filtered = catalog.filter(item =>
      item.id !== product?.id || item.img !== product?.img
    );

    // If we filtered out the current item, we might have fewer than 5.
    // We'll take what's left, and if it's empty, we fallback to a generic list.
    return filtered.length > 0 ? filtered : catalog.slice(0, 5);
  }, [cat, product, displayImage]);

  // Dynamic Info Rows
  const dynamicInfo = useMemo(() => [
    ['Product Type', `Antique ${cat} Set`],
    ['Material', 'Gold-plated alloy with synthetic stones'],
    ['Category', cat],
    ['Finish', 'Matte Antique Gold Finish'],
    ['Shipping', 'Free shipping across India'],
  ], [cat]);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleThumbClick = useCallback((i) => {
    setActiveThumb(prev => prev === i ? -1 : i);
  }, []);

  const handleQtyChange = useCallback((delta) => {
    setQty(prev => Math.max(1, prev + delta));
  }, []);

  const toggleDesc = useCallback(() => setDescOpen(o => !o), []);
  const toggleAddl = useCallback(() => setAddlOpen(o => !o), []);
  const toggleShowAll = useCallback(() => setShowAll(s => !s), []);

  const handleHeaderLinkClick = (link) => {
    if (link === "Home") {
      navigate("/");
    } else {
      navigate(`/${link.toLowerCase()}`);
    }
  };

  const handleBuyNow = useCallback(() => {
  navigate("/shipping", {
    state: {
      product: {
        name: displayName,
        price: displayPrice,
        qty: qty,
        img: displayImage,
        category: cat,
      }
    }
  });
}, [displayName, displayPrice, qty, displayImage, cat]);

  const handleShareWhatsApp = useCallback(() => {
    const message = `Check out this beautiful ${displayName} from Anika: ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  }, [displayName]);

  return (
    <div className="pp-root">

      {/* ── HEADER ── */}
      <SiteHeader activeLink="" onLinkClick={handleHeaderLinkClick} />

      {/* ── PRODUCT DETAIL ── */}
      <section className="pp-detail-section">
        <div className="pp-detail-card">
          <ProductGallery
            activeThumb={activeThumb}
            setActiveThumb={handleThumbClick}
            displayImage={displayImage}
            displayName={displayName}
            thumbs={dynamicThumbs}
          />

          <div className="pp-info">
            <h1 className="pp-title">{displayName}</h1>

            <div className="pp-rating">
              {'★★★★★'.split('').map((s, i) => <span key={i} className="pp-star">{s}</span>)}
              <span className="pp-rating-count">5.0 (20 Reviews)</span>
            </div>

            <div className="pp-prices">
              <span className="pp-price">{displayPrice}</span>
              <span className="pp-strike">{displayOriginal}</span>
            </div>

            <p className="pp-blurb">
              Elevate your traditional look with this exquisitely crafted gold bangle, designed to reflect timeless elegance and heritage artistry. Featuring intricate antique detailing with vibrant red and green stone embellishments, this bangle blends classic South Indian craftsmanship with a luxurious royal finish.
            </p>

            <div className="pp-cart-row">
              <div className="pp-qty">
                <button onClick={() => handleQtyChange(-1)} aria-label="Decrease quantity">−</button>
                <span>{qty}</span>
                <button onClick={() => handleQtyChange(1)} aria-label="Increase quantity">+</button>
              </div>
              <button 
                className="pp-cart-btn"
                onClick={async () => {
                  if (product) {
                    await addToCart(product, qty, null);
                    alert(`Added "${displayName}" to cart!`);
                  }
                }}
              >
                Add to Cart
              </button>
              <button 
                className="pp-wish-btn" 
                aria-label="Add to wishlist"
                onClick={async () => {
                  if (product) {
                    await toggleWishlist(product);
                  }
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "#C42049" : "none"} stroke={isWishlisted ? "#C42049" : "#888"} strokeWidth="1.5" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            <button className="pp-buy-btn" onClick={handleBuyNow}>Buy Now</button>

            <div className='pp-opay'>
              <p>Guaranteed Safe Checkout</p>
              <div className='pp-opay-icons'>
                <img src = {PayPalIcon} alt = "Paypal"/>
                <img src = {RazorIcon} alt = "Razor Pay"/>
                <img src = {GPayIcon} alt = "Google Pay"/>
              </div>
            </div>

            <div className="pp-ship-info">
              <div className="pp-ship-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7b1d1d" strokeWidth="2" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Worldwide shipping on any order</span>
              </div>
              <div className="pp-ship-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7b1d1d" strokeWidth="2" aria-hidden="true">
                  <rect x="1" y="3" width="15" height="13" />
                  <path d="M16 8h4l3 3v5h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>
                  Delivers in 5–7 working days &nbsp;
                  <button className="pp-ship-link">Shipping &amp; Return</button>
                </span>
              </div>
            </div>

            <div className="pp-share">
              <span>Share</span>
                <a
                  href='https://www.facebook.com/people/anikafashionstore/100090910872220/?ref=1'
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pp-share-btn fb"
                  aria-label="Share on Facebook"
                >
                  <FacebookIcon />
                </a>

                <a
                  href="https://www.instagram.com/anikafashionstore.jewellery/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pp-share-btn ins"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              <button
                className="pp-share-btn wa"
                aria-label="Share on WhatsApp"
                onClick={handleShareWhatsApp}
              >
                <WhatsappIcon />
              </button>
            </div>

            {/* ── ACCORDIONS (Moved inside pp-info for desktop side-by-side) ── */}
            <div className="pp-accordions">
              <div className="pp-acc-item">
                <button className="pp-acc-head" onClick={toggleDesc} aria-expanded={descOpen}>
                  <span>Descriptions</span>
                  <svg className={`pp-chev ${descOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                  </svg>
                </button>
                {descOpen && (
                  <div className="pp-acc-body">
                    {cat === 'Earrings' ? (
                      <>
                        <p>Elevate your ensemble with the timeless elegance of our Antique Earring collection. Meticulously handcrafted, these earrings feature intricate jhumka and stud patterns inspired by traditional Indian temple jewelry. Each piece is adorned with premium stones that catch the light beautifully against the rich matte gold finish.</p>
                        <p>Designed for both grandeur and comfort, these earrings are lightweight enough for all-day wear at weddings, festivals, or special celebrations. The antique plating ensures a long-lasting vintage glow that complements any ethnic attire, from silk sarees to designer lehengas.</p>
                        <p>Our commitment to quality ensures that every earring set is a masterpiece of detail. Let Veluno's antique earrings frame your face with grace and become a cherished addition to your jewelry treasure chest.</p>
                      </>
                    ) : (
                      <>
                        <p>Adorn your wrists with the regal charm of our Antique Bangle Set, a masterpiece of traditional craftsmanship. This exquisite piece is meticulously designed with intricate floral motifs and ancient patterns that evoke the grandeur of royal heritage. The bangle features high-quality red and green stone embellishments that add a vibrant touch to the matte antique gold finish.</p>
                        <p>Perfect for weddings, festive occasions, and cultural celebrations, these bangles are crafted to be both durable and lightweight for all-day comfort. The antique gold plating is treated to maintain its rich luster over time, ensuring that this piece remains a treasured part of your jewelry collection for years to come.</p>
                        <p>Each set is carefully inspected to ensure the highest standards of quality and detail. Whether paired with a traditional saree or a modern lehenga, Veluno's Antique Bangle Set is the ultimate accessory to enhance your grace and elegance.</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="pp-acc-item">
                <button className="pp-acc-head" onClick={toggleAddl} aria-expanded={addlOpen}>
                  <span>Additional Information</span>
                  <svg className={`pp-chev ${addlOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                  </svg>
                </button>
                {addlOpen && (
                  <div className="pp-acc-body">
                    <table className="pp-info-tbl">
                      <tbody>
                        {dynamicInfo.map(([k, v]) => (
                          <tr key={k}>
                            <td className="pp-tbl-key">{k}</td>
                            <td className="pp-tbl-val">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── YOU MAY ALSO LIKE ── */}
      <RelatedProducts
        showAll={showAll}
        setShowAll={setShowAll}
        relatedItems={dynamicRelated}
        onProductClick={onProductSelect}
      />



      {/* ── CATEGORY STRIP ── */}
      <div className="pp-category-section-wrap">
        <Suspense fallback={<LoadingSkeleton height="150px" />}>
          <CategorySection onCategoryClick={handleHeaderLinkClick} />
        </Suspense>
      </div>

      {/* ── FOOTER ── */}
      <Suspense fallback={<LoadingSkeleton height="300px" />}>
        <SiteFooter />
      </Suspense>
    </div>
  );
}
