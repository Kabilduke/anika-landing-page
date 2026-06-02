// RealExperience.jsx
import { useState, useRef, useEffect } from 'react';
import './RealExperience.css';
import Ig1 from '../assets/ig/Frame 2147225711.webp';
import Ig2 from '../assets/ig/Frame 2147225712 (1).webp';
import Ig3 from '../assets/ig/Frame 2147225713.webp';
import Ig4 from '../assets/ig/Frame 2147225714.webp';

const EXPERIENCES = [
  { img: Ig1, link: "https://www.instagram.com/reel/DWYuEIsEj9j/?igsh=ZzZ4MXYyNGJhZTR6" },
  { img: Ig2, link: "https://www.instagram.com/reel/DXOzX2Ckn9w/?igsh=NzR6cmVuNHIxYTRp" },
  { img: Ig3, link: "https://www.instagram.com/reel/DR1rsagCFF3/?igsh=NG12eWZpNTFzc2k=-271.15" },
  { img: Ig4, link: "https://www.instagram.com/reel/DTSbHVvkpfA/?igsh=MXBsYXB2ZWxydTByaQ==" },
];

// Duplicate items for infinite loop
const displayItems = [...EXPERIENCES, ...EXPERIENCES, ...EXPERIENCES];

const RealExperience = () => {
  const scrollRef = useRef(null);

  return (
    <div className="textParent">
      <div className="text">
        <div className="realExperiences">Real Experiences</div>
        <div className="hearFromOur">
          Hear from our happy customers who've experienced our world-magic.
        </div>
      </div>
      
      <div 
        className="experience-scroll-container" 
        ref={scrollRef}
      >
        <div className="experience-track">
          {displayItems.map((item, index) => (
            <a 
              key={index} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="experience-item"
            >
              <img src={item.img} className="frameChild" alt={`Customer experience ${index + 1}`} loading="lazy" />
            </a>
          ))}
        </div>
      </div>

    </div>
  );
};

export default RealExperience;