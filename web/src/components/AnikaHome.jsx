import { useNavigate } from "react-router-dom";
import "./AnikaHome.css";
import HeroImage from "../assets/HomeImage.webp";
import HeroMobile from "../assets/hero image mobile.webp";
import CategorySection from "./CategorySection";
import SiteHeader from "./SiteHeader";

import { getNavPath } from "../services/categoryRoute";
import { useStore } from "../hooks/useStore";

// const NAV_LINKS = ["Home", "Rings", "Earrings", "Bracelets", "Bangles", "Necklaces", "Anklets"];


export default function AnikaHome() {
  const categories = useStore((state) => state.categories);
  const navigate = useNavigate();

  const handleNavClick = (link) => {
    if (link === 'Home') {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate(getNavPath(link, categories));
    }
  };

  return (
    <div className="page">

      {/* ── Header ── */}
      <SiteHeader activeLink="Home" onLinkClick={handleNavClick} />


      {/* ── Mobile Category Row (moved below hero section in HomePage) ── */}
      {/* <div className="mobile-top-categories mobile-only">
        <CategorySection onCategoryClick={(name) => navigate(getNavPath(name, categories))} />
      </div> */}

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-image-wrapper">
          {/* Background image */}
          <picture>
            <source media="(max-width: 768px)" srcSet={HeroMobile} />
            <img
              src={HeroImage}
              alt="Jewellery hero"
              className="hero-image"
              fetchPriority="high"
            />
          </picture>

          {/* Dark gradient overlay — covers bottom half on mobile, left strip on desktop */}
          <div className="hero-overlay" />

          {/* Text content — absolute inside the image wrapper */}
          <div className="hero-content">
            <h1 className="hero-title">Draped in Elegance</h1>
            <p className="hero-subtitle">
              Discover handcrafted fashion jewellery <br />for every occasion
            </p>
            <button className="explore-btn" onClick={() => {
              const element = document.getElementById('shop');
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}>
              Explore Now
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}