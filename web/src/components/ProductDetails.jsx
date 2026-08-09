import React, { useState, useCallback, useMemo, useEffect, memo, lazy, Suspense } from 'react';
import { useNavigate } from "react-router-dom";
import { supabase } from '../lib/supabase';
import './ProductDetails.css';
import SiteHeader from './SiteHeader';
import Toast from './Toast';
import { useStore } from '../hooks/useStore';
import SizeChart from '../assets/Size_bangle.png';
import LengthChart from '../assets/Anklet_length.jpeg'


import DescIcon from '../assets/details/ad_pro.svg';
import SpecIcon from '../assets/details/mat.svg';
import DeliveryIcon from '../assets/details/del.svg';
import ReturnIcon from '../assets/details/re.svg';
import AuthenticityIcon from '../assets/details/hand.svg';
import HelpIcon from '../assets/details/help.svg';

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


// ── Memoized sub-components ──────────────────────────────────────────────────
const ProductGallery = memo(({ activeThumb, setActiveThumb, displayImage, displayName, thumbs, discountPct }) => {
  const currentIndex = activeThumb === -1 ? 0 : activeThumb;
  const currentImg = activeThumb === -1 ? displayImage : thumbs[activeThumb].img;

  const [zoomOpen, setZoomOpen] = useState(false);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const goToIndex = (i) => {
    const clamped = Math.max(0, Math.min(thumbs.length-1, i));
    setActiveThumb(clamped)
  };

  const handleTouchStart = (e) =>{
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const SWIPE_THRESHOLD = 50;
    if (Math.abs(diff) > SWIPE_THRESHOLD){
      if (diff > 0){
        goToIndex(currentIndex + 1);
      } else {
        goToIndex(currentIndex - 1);
      }
    }
    setTouchStartX(null);
  };

  const handleZoomImageClick = (e) =>{
    if (!isZoomedIn){
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
    }
    setIsZoomedIn(z => !z);
  };

  const closeZoom = () => {
    setZoomOpen(false);
    setIsZoomedIn(false);
  };

  return(
    <div className="pp-gallery">
      <div className="pp-main-wrap">
        <div className="pp-image-container-inner"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="pp-main-badge">{discountPct > 0 ? `${discountPct}% Off` : ''}
          </div>
          

          <button
            className="pp-zoom-btn"
            aria-label="Zoom image"
            onClick={() => setZoomOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          
          <img
            src={activeThumb === -1 ? displayImage : thumbs[activeThumb].img}
            alt={displayName}
            className="pp-main-img"
            loading="eager"
            decoding="sync"
          /> 
        </div>
      </div>

      {thumbs.length >1 && (
        <div className="pp-dots" role="tablist" aria-label="Product images">
          {thumbs.map((item, i) => (
            <button
              key={item.id}
              className={`pp-dot ${currentIndex === i ? 'active' : ''}`}
              onClick={() => setActiveThumb(i)}
              aria-label={`View image ${i + 1}`}
              aria-selected={currentIndex === i}
              role="tab"
            />
          ))}
        </div>
      )}

      {zoomOpen && (
        <div className="pp-zoom-overlay" onClick={closeZoom}>
          <button className="pp-zoom-close" onClick={closeZoom} aria-label="Close zoom">✕</button>
          <img
            src={currentImg}
            alt={displayName}
            className={`pp-zoom-img ${isZoomedIn ? 'zoomed' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleZoomImageClick(e); }}
          />
          <p className="pp-zoom-hint">{isZoomedIn ? 'Click to zoom out' : 'Click image to zoom in'}</p>
        </div>
      )}
    </div>
  );
});
   

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
              {/* <p className="pp-rel-sub">{p.sub}</p> */}
              <div className="pp-rel-prices">
                <span className="pp-rel-price">{p.price}</span>
                <span className="pp-rel-orig"> MRP: {p.original}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {relatedItems.length > 4 && (
        <div className="pp-show-wrap">
          <button className="pp-show-btn" onClick={() => setShowAll(s => !s)}>
            {showAll ? 'Show Less' : 'Show More'}
          </button>
        </div>
      )}
    </section>
  );
});

// ═════════════════════════════════════════════════════════════════════════════
export default function ProductPage({ onBack }) {
  const navigate = useNavigate();

  // Zustand Store
  const selectedProduct = useStore(state => state.selectedProduct);
  const setSelectedProduct = useStore(state => state.setSelectedProduct);
  const addToCart = useStore(state => state.addToCart);
  const toggleWishlist = useStore(state => state.toggleWishlist);
  const wishlistItems = useStore(state => state.wishlistItems);
  const fetchProductsByCategory = useStore(state => state.fetchProductsByCategory);
  const productsCache = useStore(state => state.products);

  const cat = selectedProduct?.category || 'Bangles';

  // React State Hooks
  const [activeThumb, setActiveThumb] = useState(-1);
  const [qty, setQty] = useState(1);

  const [descOpen, setDescOpen] = useState(false);
  const [addlOpen, setAddlOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [warrantyOpen, setWarrantyOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);


  const [productImages, setProductImages] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [productPrices, setProductPrice] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Dynamic sizes/lengths fetched from database
  const [size, setSize] = useState([]);
  const [length, setLength] = useState([]);

  useEffect(() => {
    const productId = selectedProduct?.productId || selectedProduct?.id;
    if (!productId) return;

    const fetchImages = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('images', 'image_url')
        .eq('product_id', productId)
        .single()

        if (error || !data) return;

        const imgs = Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : (data.image_url ? [data.image_url] : []);
      
        setProductImages(imgs)
    };

    const fetchPrices = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('price, compare_price, discount_price, sku, stock, stock_alert')
        .eq('product_id', productId)
        .single();

      if (error || !data) return;
      setProductPrice(data)
    };

    const fetchSizes = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('sizes')
        .eq('product_id', productId)
        .single();

      if (error || !data?.sizes?.length) return;

      if (cat === 'Bangles') {
        setSize(data.sizes);
        setSelectedSize(data.sizes[0] || "");
      } else if (cat === 'Anklets') {
        setLength(data.sizes);
        setSelectedLength(data.sizes[0] || "");
      }
    };

    setSize([]);
    setLength([]);
    setProductImages([]); 
    setProductPrice(null);
    fetchPrices();
    fetchSizes();
    fetchImages();
  }, [selectedProduct, cat]);

  const showToast = (message, type = "success") => {
    setToastMsg("");
    setToastType(type);
    setTimeout(() => setToastMsg(message), 10);
  };

  const isWishlisted = useMemo(() => {
    const currentId = selectedProduct?.productId || selectedProduct?.id;
    return wishlistItems.some(w => w.id === currentId);
  }, [wishlistItems, selectedProduct]);

  // Determine which image to show in gallery
  const rawPrice = productPrices?.price ?? selectedProduct?.price ?? null;
  // const rawCompare = productPrices?.compare_price ?? selectedProduct?.compare_price  ?? null;
  const rawCompare = productPrices?.compare_price ?? selectedProduct?.originalPrice ?? null;
  const rawDiscount = productPrices?.discount_price ?? 0;
  const displayImage = selectedProduct?.img || selectedProduct?.image || MainBangle;
  const displayName = selectedProduct?.name || 'Antique Bangle set';
  const displaySku = productPrices?.sku || selectedProduct?.sku || '';
  const stockCount = productPrices?.stock ?? selectedProduct?.stock ?? null;
  const stockAlertThreshold = productPrices?.stock_alert ?? 10; 

  const payPrice = rawDiscount && rawPrice
    ? Number(rawPrice) - Number(rawDiscount)
    : (rawPrice != null ? Number(rawPrice) : 0);
  // : Number(rawPrice) ?? 0;

  const strikePrice = rawCompare ?? null;

  const displayPrice = payPrice ? `₹${Number(payPrice).toLocaleString('en-IN')}` : '';
  const displayOriginal = strikePrice ? `₹${Number(strikePrice).toLocaleString('en-IN')}` : '';

  const discountPct = strikePrice && payPrice && strikePrice > payPrice
    ? Math.round(((strikePrice - payPrice) / strikePrice) * 100)
    : 0;

  const dynamicThumbs = useMemo(() => {
    const imgs = productImages.length > 0 ? productImages : [displayImage];
    return imgs.map((img, i) => ({
      id: i + 1,
      img,
      alt : `${displayName} view ${i + 1}` 
    }));
  }, [productImages, displayImage, displayName]);

  // Fetch related products from DB when category changes
  useEffect(() => {
    fetchProductsByCategory(cat);
  }, [cat, fetchProductsByCategory]);

  // Scroll to top when selected product changes (resets window scroll and desktop column scroll)
  useEffect(() => {
    window.scrollTo(0, 0);
    const infoCol = document.querySelector('.pp-info');
    if (infoCol) {
      infoCol.scrollTop = 0;
    }
  }, [selectedProduct]);

  // Dynamic Related Items from DB catalog
  const dynamicRelated = useMemo(() => {
    const dbProducts = productsCache[cat] || [];
    const currentId = selectedProduct?.productId || selectedProduct?.id;

    // Map DB products to the shape RelatedProducts expects
    const mapped = dbProducts
      .filter(p => p.id !== currentId && p.productId !== currentId)
      .map(p => ({
        ...p,
        sub: p.desc || p.category || cat,
        price: typeof p.price === 'number' ? `₹${p.price}.00` : p.price,
        original: p.originalPrice
          ? (typeof p.originalPrice === 'number' ? `₹${p.originalPrice}.00` : p.originalPrice)
          : p.original || '',
        badge: '',
        category: p.category || cat,
      }));

    return mapped.length > 0 ? mapped : [];
  }, [cat, productsCache, selectedProduct]);

  // Dynamic Info Rows
  const dynamicInfo = useMemo(() => [
    ['Product Type', `Antique ${cat} Set`],
    ['Material', 'Gold-plated alloy with synthetic stones'],
    ['Category', cat],
    ['Finish', 'Matte Antique Gold Finish'],
    ['Shipping', 'Shipping  available across India'],
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
  const toggleDelivery = () => setDeliveryOpen((prev) => !prev);
  const toggleReturn = () => setReturnOpen((prev) => !prev);
  const toggleWarranty = () => setWarrantyOpen((prev) => !prev);
  const toggleHelp = () => setHelpOpen((prev) => !prev);

  const toggleShowAll = useCallback(() => setShowAll(s => !s), []);

  const handleHeaderLinkClick = (link) => {
    if (link === "Home") {
      navigate("/");
    } else {
      navigate(`/${link.toLowerCase()}`);
    }
  };

  const handleRelatedProductClick = useCallback((product) => {
    const formattedProduct = {
      ...product,
      price: typeof product.price === 'number' ? `₹${product.price}.00` : product.price,
      original: product.originalPrice
        ? (typeof product.originalPrice === 'number' ? `₹${product.originalPrice}.00` : product.originalPrice)
        : product.original || '',
      category: product.category || cat,
    };
    setSelectedProduct(formattedProduct);
    navigate("/product");
  }, [cat, setSelectedProduct, navigate]);

  const handleBuyNow = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/account/signup");
      return;
    }

    const sizeParam = cat === 'Bangles' ? selectedSize : (cat === 'Anklets' ? selectedLength : null);
    navigate("/shipping", {
      state: {
        product: {
          productId: selectedProduct?.productId || selectedProduct?.id,
          name: displayName,
          price: displayPrice,
          qty: qty,
          img: displayImage,
          category: cat,
          size: sizeParam,
        }
      }
    });
  }, [displayName, displayPrice, qty, displayImage, cat, selectedProduct, selectedSize, selectedLength]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: displayName,
      text: `Check out this beautiful ${displayName} from Anika`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled or share failed silently
      }
    } else {
      // Desktop fallback: WhatsApp share
      const message = `${shareData.text}: ${shareData.url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
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
            discountPct={discountPct}
          />

          <div className="pp-info">
            <div className='pp-title-row'>
              <h1 className="pp-title">{displayName}</h1>

              <button 
                className='pp-title-share-btn' 
                aria-label='share the product'
                onClick={handleShare}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
            </div>
            {displaySku && (
              <p className="pp-sku">SKU: {displaySku}</p>
            )}
  
            <div className="pp-rating">
              {'★★★★★'.split('').map((s, i) => <span key={i} className="pp-star">{s}</span>)}
              <span className="pp-rating-count">5.0 (25 Reviews)</span>
            </div>

            <div className="pp-prices">
              <span className="pp-price">{displayPrice}</span>
              <span className="pp-strike">MRP:{displayOriginal}</span>
              {discountPct > 0 && (
                <span className='pp-discount-badge'>{discountPct}% Off</span>
              )}
            </div>
            <p className="pp-tax-note">Inclusive of all taxes</p>

            {cat == 'Bangles' && (
              <div className='pp-size'>
                <div className='pp-size-row'>
                  <h4>Size: {selectedSize}</h4>
                  <a href="#" className="pp-size-link"
                    onClick={(e) => { e.preventDefault(); setShowSizeChart(true) }}
                  >Size Chart</a>
                </div>

                {showSizeChart && (
                  <div className='pp-size-chart-overlay' onClick={() => setShowSizeChart(false)}>
                    <div className='pp-size-chart-modal' onClick={(e) => e.stopPropagation()}>
                      <button className='pp-size-chart-close' onClick={() => setShowSizeChart(false)}>
                        x
                      </button>
                      <img src={SizeChart} alt="Size Chart" />
                    </div>
                  </div>
                )}
                <div className='pp-size-buttons'>
                  {size.map((size) => (
                    <button
                      key={size}
                      className={`pp-size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {cat == 'Anklets' && (
              <div className='pp-size'>
                <div className='pp-size-row'>
                  <h4>Size: {selectedLength}</h4>
                  <a href="#" className="pp-size-link"
                    onClick={(e) => { e.preventDefault(); setShowSizeChart(true) }}
                  >Size Chart</a>
                </div>

                {showSizeChart && (
                  <div className='pp-size-chart-overlay' onClick={() => setShowSizeChart(false)}>
                    <div className='pp-size-chart-modal' onClick={(e) => e.stopPropagation()}>
                      <button className='pp-size-chart-close' onClick={() => setShowSizeChart(false)}>
                        x
                      </button>
                      <img src={LengthChart} alt="Size Chart" />
                    </div>
                  </div>
                )}
                <div className='pp-size-buttons'>
                  {length.map((size) => (
                    <button
                      key={size}
                      className={`pp-size-btn ${selectedLength === size ? 'active' : ''}`}
                      onClick={() => setSelectedLength(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}


            {stockCount != null && (
              <div className="pp-stock">
                {stockCount === 0 ?(
                  <span className="pp-stock-out">Out of stock</span>
                ) : stockCount <= stockAlertThreshold ? (
                  <span className="pp-stock-low">Hurry, Only {stockCount} item{stockCount > 1 ? 's' : ''} left in stock!</span>
                ): (
                  <span className="pp-stock-ok">In stock</span>
                )}
              </div>
            )}
            <div className="pp-ship-row">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7b1d1d" strokeWidth="2" aria-hidden="true">
                  <rect x="1" y="3" width="15" height="13" />
                  <path d="M16 8h4l3 3v5h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>
                Delivers in 3 – 4 business days &nbsp;
                <button className="pp-ship-link">Shipping &amp; Return</button>
              </span>
            </div>

            <div className="pp-cart-row">
              <div className="pp-qty">
                <button onClick={() => handleQtyChange(-1)} aria-label="Decrease quantity">−</button>
                <span>{qty}</span>
                <button onClick={() => handleQtyChange(1)} aria-label="Increase quantity">+</button>
              </div>
              <button
                className="pp-cart-btn"
                onClick={async () => {
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session) {
                    navigate("/account/signup");
                    return;
                  }
                  if (selectedProduct) {
                    const sizeParam = cat === 'Bangles' ? selectedSize : (cat === 'Anklets' ? selectedLength : null);
                    await addToCart(selectedProduct, qty, sizeParam);
                    showToast(`Added "${displayName}" to cart!`);
                  }
                }}
              >
                Add to Cart
              </button>
              <button
                className="pp-wish-btn"
                aria-label="Add to wishlist"
                onClick={async () => {
                  if (selectedProduct) {
                    await toggleWishlist(selectedProduct);
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
                <img src={PayPalIcon} alt="Paypal" />
                <img src={RazorIcon} alt="Razor Pay" />
                <img src={GPayIcon} alt="Google Pay" />
              </div>
            </div> 

            {/* ── ACCORDIONS (Moved inside pp-info for desktop side-by-side) ── */}
            <div className="pp-accordions">
              <div className="pp-acc-item">
                <button className="pp-acc-head" onClick={toggleDesc} aria-expanded={descOpen}>
                  <span className='pp-acc-label'>
                    <img src={DescIcon} alt="" className="pp-acc-icon" />
                    About Product
                  </span>
                  <svg className={`pp-chev ${descOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                  </svg>
                </button>
                {descOpen && (
                  <div className='pp-acc-body'>
                    {selectedProduct?.desc ? (
                      selectedProduct.desc
                        .split("\n")
                        .filter((para) => para.trim())
                        .map((para, i) => <p key={i}>{para}</p>)
                    ) : (
                      <p>No description available for this product yet.</p>
                    )}
                    <div className='pp-promise'>
                      <h4 className="pp-promise-title">Our Promise to You</h4>
                      <ul className='pp-promise-list'>
                        <li>All our products are 100% Brand New.</li>
                        <li>Every piece is hand checked by our team before shipping.</li>
                        <li>What you see in photos is exactly what you get. No misleading filters or editing enhancements.</li>
                        <li>Secure packaging to ensure damage-free delivery.</li>
                        <li>All our products are skin friendly, made from brass/copper (except for Impon (Anti tarnished) collection).</li>
                        <li>Dispatch time for orders: 24 hrs to 48 hrs of order confirmation; Shipping 2–3 days.</li>
                        <li>You will get WhatsApp and e-mail updates of your order once confirmed.</li>
                        <li>For additional images/videos: please WhatsApp <a href="tel:+919363131636">9363131636</a> (Mon–Sat, 10 AM–5 PM). Queries will be answered in order.</li>
                      </ul>
                    </div>
                  </div>
                )}

              </div>

              <div className="pp-acc-item">
                <button className="pp-acc-head" onClick={toggleAddl} aria-expanded={addlOpen}>
                  <span className='pp-acc-label'>
                    <img src={SpecIcon} alt="" className="pp-acc-icon" />
                    Material & Specifications
                  </span>
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

              <div className='pp-acc-item'>
                <button className='pp-acc-head' onClick={toggleDelivery} aria-expanded={deliveryOpen}>
                  <span className='pp-acc-label'>
                    <img src={DeliveryIcon} alt="" className="pp-acc-icon" />
                    Delivery Details
                  </span>
                  <svg className={`pp-chev ${deliveryOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                  </svg>
                </button>
                {deliveryOpen && (
                  <div className='pp-acc-body'>
                    <p>At Anika, we ensure that your order reaches you safely and as quickly as possible. Please read our shipping policy carefully before placing your order.</p>

                    <div className='pp-policy-block'>
                      <h4 className="pp-policy-block-title">Order Processing Time</h4>
                      <ul className="pp-policy-block-list">
                        <li>All orders are processed within 2–3 business days (excluding Sundays and public holidays).</li>
                      </ul>
                    </div>

                    <div className='pp-policy-block'>
                      <h4 className="pp-policy-block-title">Shipping Timeline</h4>
                      <ul className='pp-policy-block-list'>
                        <li>We ship across India through trusted courier partners (DTDC, Ekart, ST Courier).</li>
                        <li>Delivery typically takes 3–7 business days depending on your location.</li>
                        <li>During high-demand seasons or unforeseen delays (like weather or courier issues), delivery may take slightly longer.</li>
                      </ul>
                    </div>

                    <div className='pp-policy-note'>
                      <strong>Address Accuracy – Please Note</strong>
                      <p>Before placing your order, please double-check your shipping address, phone number, and PIN code.</p>
                      <p>If a package is misrouted or returned due to an incorrect or incomplete address, the courier and our company will not bear any responsibility.</p>
                      <p>In such cases, customers will have to bear any reshipping charges or product loss incurred.</p>
                    </div>

                    <div className='pp-policy-block'>
                      <h4 className="pp-policy-block-title">Non-Serviceable Areas</h4>
                      <ul className='pp-policy-block-list'>
                        <li>⁠If your PIN code is not serviceable by our delivery partners, we will reach out to you for an alternative address.</li>
                      </ul>
                    </div>

                    <div className='pp-policy-block'>
                      <h4 className="pp-policy-block-title">Tracking Information</h4>
                      <ul className='pp-policy-block-list'>
                        <li>Once your order is shipped, a tracking link will be sent via email/WhatsApp number</li>
                        <li>You can use this to track the real-time status of your delivery.</li>
                      </ul>
                    </div>

                    <div className='pp-policy-block'>
                      <h4 className='pp-policy-block-title'>Please Note</h4>
                      <ul className='pp-policy-block-list'>
                        <li>All our orders are prepaid, and you have already paid the courier charges during checkout.</li>
                        <li>If any delivery person asks for additional money, security deposit, or any extra payment, please do NOT pay.</li>
                        <li>Such requests are not from us and may be a scam.</li>
                        <li>In case this happens, kindly refuse the package and immediately contact us through WhatsApp or call.</li>
                        <li>We use only reputed courier services, and we have never faced such issues. This message is shared purely to keep our customers aware and safe.</li>
                        <li>Your safety and trust mean the most to us.</li>
                      </ul>

                    </div>
                  </div>
                )}
              </div>

              <div className='pp-acc-item'>
                <button className='pp-acc-head' onClick={toggleReturn} aria-expanded={returnOpen}>
                  <span className='pp-acc-label'>
                    <img src={ReturnIcon} alt="" className="pp-acc-icon" />
                    Return & Refund Policy
                  </span>
                  <svg className={`pp-chev ${returnOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                  </svg>
                </button>
                {returnOpen && (
                  <div className='pp-acc-body'>
                    <div className='pp-policy-block pp-policy-block--reject'>
                      <h4 className="pp-policy-block-title pp-policy-block-title--reject">We Do NOT Accept Returns for the Following Reasons</h4>
                      <ul className="pp-policy-block-list pp-policy-block-list--reject">
                        <li>Product doesn't suit you.</li>
                        <li>Changed mind after ordering.</li>
                        <li>Ordered for someone else and they didn't like it.</li>
                        <li>Someone ordered on your behalf.</li>
                        <li>Order placed by mistake.</li>
                        <li>Bangle size / motif width doesn't fit.</li>
                        <li>Delays in delivery.</li>
                        <li>Product not received before your occasion date.</li>
                        <li>Damage while wearing or trying after delivery.</li>
                      </ul>
                    </div>

                    <div className='pp-policy-block pp-policy-block--accept'>
                      <h4 className="pp-policy-block-title pp-policy-block-title--accept">We Accept Returns Only for the Following</h4>
                      <ul className='pp-policy-block-list pp-policy-block-list--accept'>
                        <li>Damages</li>
                        <li>Missing items</li>
                      </ul>
                    </div>

                    <div className='pp-policy-note'>
                      <strong>Return Request Process</strong>
                      <p>Please follow the steps below within 24 hrs of delivery.</p>
                      <ol className='pp-policy-steps'>
                        <li>
                          Report the issue on WhatsApp with:
                          <ul className='pp-policy-block-list'>
                            <li>Name</li>
                            <li>Order ID</li>
                            <li>360° Unboxing Video (Compulsory – No cuts/editing)</li>
                          </ul>
                        </li>
                      </ol>
                      <p><strong>Repacked items will not be accepted.</strong></p>
                      <p><strong>Issues reported after 24 hrs of delivery will not be accepted.</strong></p>
                      <p><strong>Packages returned without an unboxing video will not be considered for review</strong></p>
                    </div>

                    <div className='pp-policy-block'>
                      <h4 className='pp-policy-block-title'>Approved Return Instruction</h4>
                      <ul className='pp-policy-block-list'>
                        <li>⁠Return the item within 48 hrs of delivery.</li>
                        <li>You can use India Post, ST Courier, Franch Express or DTDC.</li>
                        <li>Shipping cost of ₹80 will be reimbursed by us.</li>
                        <li>Our team will share the return address.</li>
                        <li>Kindly forward the tracking number on WhatsApp once dispatched.</li>
                      </ul>
                    </div>

                    <div className='pp-policy-block'>
                      <h4 className='pp-policy-block-title'>Refund / Replacement</h4>
                      <ul className='pp-policy-block-list'>
                        <li>Once the product is received and inspected, we’ll inform you of the status via WhatsApp.</li>
                        <li>⁠Replacement will be shipped at no additional cost.</li>
                        <li>⁠Refund, if applicable, will be processed for the product price only.</li>
                      </ul>
                    </div>

                  </div>
                )}
              </div>

              <div className='pp-acc-item'>
                <button className='pp-acc-head' onClick={toggleWarranty} aria-expanded={warrantyOpen}>
                  <span className='pp-acc-label'>
                    <img src={AuthenticityIcon} alt="" className="pp-acc-icon" />
                    Authenticity & Warranty
                  </span>
                  <svg className={`pp-chev ${warrantyOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                  </svg>
                </button>
                {warrantyOpen && (
                  <div className="pp-acc-body">
                    <p>This product is covered under a manufacturer warranty against defects in materials and workmanship.</p>
                    <p>Warranty does not cover damage from misuse, accidents, or normal wear and tear.</p>
                  </div>
                )}
              </div>

              <div className='pp-acc-item'>
                <button className='pp-acc-head' onClick={toggleHelp} aria-expanded={helpOpen}>
                  <span className='pp-acc-label'>
                    <img src={HelpIcon} alt="" className="pp-acc-icon" />
                    Need Help?
                  </span>
                  <svg className={`pp-chev ${helpOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                  </svg>
                </button>
                {helpOpen && (
                  <div className='pp-acc-body'>
                    <p>Call us at <a href="tel:+919363631636">+91 93636 31636</a>, Mon–Sat, 9:30 AM – 6:30 PM IST.</p>
                    <p>Or write to us anytime and we'll get back within 24 hours.</p>
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
        onProductClick={handleRelatedProductClick}
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

      {/* ── TOAST ── */}
      <Toast
        message={toastMsg}
        type={toastType}
        onClose={() => setToastMsg("")}
      />
    </div>
  );
}
