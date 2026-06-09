import React, { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import AnikaHome from './AnikaHome';
import './HomePage.css';
import { useStore } from '../hooks/useStore';

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

export default function HomePage() {
  const navigate = useNavigate();
  const setSelectedProduct = useStore(state => state.setSelectedProduct);

  // Wrap setSelectedProduct to also navigate
  const handleProductClick = (product) => {
    setSelectedProduct(product);      // saves product to Zustand state
    navigate('/product');         // then go to product page
  };

  const handleCategoryClick = (name) => {
    navigate(`/${name.toLowerCase()}`);
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