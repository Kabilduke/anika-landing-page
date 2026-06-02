import React, { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import AnikaHome from './AnikaHome';
import './HomePage.css';

const ProductSection = lazy(() => import('./ProductSection'));
const BannerSection = lazy(() => import('./BannerSection'));
const CategorySection = lazy(() => import('./CategorySection'));
const CollectionsSection = lazy(() => import('./CollectionsSection'));
const NecklaceShowcase = lazy(() => import('./NecklaceShowcase'));
const RealExperience = lazy(() => import('./RealExperience'));
const Offers = lazy(() => import('./Offers'));
const CustomerExperiences = lazy(() => import('./CustomerExperiences'));
const SiteFooter = lazy(() => import('./SiteFooter'));

const SectionLoader = () => (
  <div style={{ height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  </div>
);

export default function HomePage({ onProductClick }) {
  const navigate = useNavigate();

  // Wrap onProductClick to also navigate
  const handleProductClick = (product) => {
    onProductClick(product);      // saves product to App state
    navigate('/product');         // then go to product page
  };

  const handleCategoryClick = (name) => {
    let sectionId = '';

    if (name === 'Necklaces') {
      sectionId = 'necklaces';
    } else if (name === 'Bangles') {
      sectionId = 'shop';
    } else if (name === 'Earrings') {
      sectionId = 'offers';
    } else {
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="homepage">
      <AnikaHome />

      <Suspense fallback={<SectionLoader />}>
        <div id="shop"><ProductSection onProductClick={handleProductClick} /></div>
        <BannerSection />
        <div id="categories" className="desktop-only">
          <CategorySection onCategoryClick={handleCategoryClick} />
        </div>
        <CollectionsSection />
        <div id="necklaces"><NecklaceShowcase /></div>
        <RealExperience />
        <div id="offers"><Offers onProductClick={handleProductClick} /></div>
        <div id="reviews"><CustomerExperiences /></div>
        <SiteFooter />
      </Suspense>
    </div>
  );
}