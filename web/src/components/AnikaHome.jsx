import "./AnikaHome.css";
import HeroImage from "../assets/HomeImage.webp";
import HeroMobile from "../assets/hero image mobile.webp";
import CategorySection from "./CategorySection";
import SiteHeader from "./SiteHeader";

const NAV_LINKS = ["Home", "Rings", "Earrings", "Bracelets", "Bangles", "Necklaces"];

export default function AnikaHome() {
  const scrollToSection = (id) => {
    if (id === 'Home') {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    const mapping = {
      'Rings': 'shop',
      'Earrings': 'offers',
      'Bracelets': 'shop',
      'Bangles': 'shop',
      'Necklaces': 'necklaces'
    };
    
    const targetId = mapping[id] || id.toLowerCase();
    const element = document.getElementById(targetId);
    
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="page">

      {/* ── Header ── */}
      <SiteHeader activeLink="Home" onLinkClick={scrollToSection} />


      {/* ── Mobile Category Row (Above Hero) ── */}
      <div className="mobile-top-categories mobile-only">
        <CategorySection onCategoryClick={(name) => scrollToSection(name)} />
      </div>

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
              Discover handcrafted fashion jewellery <br/>for every occasion
            </p>
            <button className="explore-btn" onClick={() => scrollToSection('shop')}>
              Explore Now
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}