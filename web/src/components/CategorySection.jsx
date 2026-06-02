import './CategorySection.css';

import Rings from '../assets/Rings1.webp';
import Earrings from '../assets/Earrings.webp';
import Bracelets1 from '../assets/Bracelets1.webp';
import Bangles from '../assets/Bangles.webp';
import Necklaces from '../assets/Necklaces.webp';

export default function CategorySection({ onCategoryClick }) {
  const categories = [
    { name: 'Rings', img: Rings },
    { name: 'Earrings', img: Earrings },
    { name: 'Bracelets', img: Bracelets1 },
    { name: 'Bangles', img: Bangles },
    { name: 'Necklaces', img: Necklaces },
  ];

  return (
    <section className="category-section">
      <div className="category-wrapper">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="category-item"
            onClick={() => onCategoryClick && onCategoryClick(cat.name)}
          >
            <img src={cat.img} alt={cat.name} loading="lazy" decoding="async" />
            <p>{cat.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}