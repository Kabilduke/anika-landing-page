import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AnikaHome.css";
import SiteHeader from "./SiteHeader";

import { getNavPath } from "../services/categoryRoute";
import { useStore } from "../hooks/useStore";
import { bannerService } from "../services/bannerService";

export default function AnikaHome() {
  const categories = useStore((state) => state.categories);
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const data = await bannerService.getBanners();
        if (data && data.length > 0) {
          setBanners(data);
        }
      } catch (err) {
        console.error("Failed to load hero banners:", err);
      }
    }
    fetchBanners();
  }, []);

  // Auto rotate banners if more than 1
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleNavClick = (link) => {
    if (link === 'Home') {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(getNavPath(link, categories));
    }
  };

  const activeBanner = banners.length > 0 ? banners[currentIndex] : null;
  const bannerImg = activeBanner ? (activeBanner.image_url || activeBanner.image) : null;
  const bannerTitle = activeBanner?.title || "";
  const bannerDesc = activeBanner?.description || activeBanner?.tagline || "";

  return (
    <div className="page">

      {/* ── Header ── */}
      <SiteHeader activeLink="Home" onLinkClick={handleNavClick} />

      {/* ── Hero (Dynamic Banners Only) ── */}
      {bannerImg && (
        <section className="hero-section">
          <div className="hero-image-wrapper">
            <picture style={{ display: "block", width: "100%", height: "100%" }}>
              {activeBanner?.mobile_url && (
                <source media="(max-width: 640px)" srcSet={activeBanner.mobile_url} />
              )}
              <img
                src={bannerImg}
                alt={bannerTitle || "Hero banner"}
                className="hero-image"
                fetchPriority="high"
              />
            </picture>

            {/* Dark gradient overlay */}
            <div className="hero-overlay" />

            {/* Text content */}
            {(bannerTitle || bannerDesc) && (
              <div className="hero-content">
                {bannerTitle && <h1 className="hero-title">{bannerTitle}</h1>}
                {bannerDesc && <p className="hero-subtitle">{bannerDesc}</p>}
                <button className="explore-btn" onClick={() => {
                  const element = document.getElementById('shop');
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}>
                  Explore Now
                </button>
              </div>
            )}

            {/* Carousel dots if multiple banners */}
            {banners.length > 1 && (
              <div className="hero-dots">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    className={`hero-dot ${idx === currentIndex ? "hero-dot--active" : ""}`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}