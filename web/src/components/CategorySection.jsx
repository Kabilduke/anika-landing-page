// import './CategorySection.css';

// import Rings from '../assets/Rings1.webp';
// import Earrings from '../assets/Earrings.webp';
// import Bracelets1 from '../assets/Bracelets1.webp';
// import Bangles from '../assets/Bangles.webp';
// import Necklaces from '../assets/Necklaces.webp';
// import Anklets from '../assets/Anklets.avif';

// export default function CategorySection({ onCategoryClick }) {
//   const categories = [
//     { name: 'Rings', img: Rings },
//     { name: 'Earrings', img: Earrings },
//     { name: 'Bracelets', img: Bracelets1 },
//     { name: 'Bangles', img: Bangles },
//     { name: 'Necklaces', img: Necklaces },
//     { name: 'Anklets', img: Anklets }
//   ];

//   return (
//     <section className="category-section">
//       <div className="category-wrapper">
//         {categories.map((cat) => (
//           <div
//             key={cat.name}
//             className="category-item"
//             onClick={() => onCategoryClick && onCategoryClick(cat.name)}
//           >
//             <img src={cat.img} alt={cat.name} loading="lazy" decoding="async" />
//             <p>{cat.name}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }

import { useState, useEffect } from "react";
import { productService } from "../services/productService";
import "./CategorySection.css";

export default function CategorySection({ onCategoryClick }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(data.filter((cat) => cat.is_active));
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="category-section">
        <div className="category-wrapper">
          <p>Loading categories...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="category-section">
      <div className="category-wrapper">
        {categories.map((cat) => (
          <div
            key={cat.category_id}
            className="category-item"
            onClick={() => onCategoryClick && onCategoryClick(cat.name)}
          >
            <img src={cat.image_url} alt={cat.name} loading="lazy" decoding="async" />
            <p>{cat.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}