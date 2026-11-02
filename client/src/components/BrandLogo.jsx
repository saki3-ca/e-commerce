import React from 'react';

/**
 * Masfeeh Haute Horlogerie & Jewelry-grade Brand Logo
 * Replaces the old low-res raster photo + emoji crown with a bespoke,
 * crisp vector royal crown & monogram medallion.
 */
export default function BrandLogo({ 
  variant = 'default', // 'default' (light bg), 'dark' (dark bg), 'iconOnly'
  size = 'md',        // 'sm', 'md', 'lg'
  showTagline = true,
  className = ''
}) {
  const isDark = variant === 'dark';

  // Sizing definitions
  const dimensions = {
    sm: { icon: 34, title: 'text-xl', subtitle: 'text-[8.5px]', gap: 'gap-2.5' },
    md: { icon: 44, title: 'text-2xl', subtitle: 'text-[9.5px]', gap: 'gap-3' },
    lg: { icon: 52, title: 'text-3xl', subtitle: 'text-[11px]', gap: 'gap-3.5' }
  }[size] || { icon: 44, title: 'text-2xl', subtitle: 'text-[9.5px]', gap: 'gap-3' };

  return (
    <div className={`flex items-center ${dimensions.gap} select-none group ${className}`}>
      {/* Bespoke Royal Crown & Monogram Medallion */}
      <div 
        className="relative shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: dimensions.icon, height: dimensions.icon }}
      >
        <svg 
          viewBox="0 0 48 48" 
          width="100%" 
          height="100%" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-xs"
        >
          <defs>
            {/* Luxury Metallic Gold Gradient */}
            <linearGradient id="masfeehGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#faecd0" />
              <stop offset="25%" stopColor="#dfb256" />
              <stop offset="65%" stopColor="#b8831e" />
              <stop offset="100%" stopColor="#875b0a" />
            </linearGradient>

            {/* Inner Sheen Gradient */}
            <linearGradient id="masfeehSheen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>

            {/* Obsidian Charcoal Background */}
            <radialGradient id="masfeehObsidian" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#2b2521" />
              <stop offset="100%" stopColor="#120f0e" />
            </radialGradient>
          </defs>

          {/* Base Medallion Circle */}
          <circle cx="24" cy="24" r="23" fill="url(#masfeehObsidian)" />
          
          {/* Subtle Top Specular Reflection */}
          <circle cx="24" cy="24" r="23" fill="url(#masfeehSheen)" />

          {/* Outer Gold Bezel */}
          <circle 
            cx="24" 
            cy="24" 
            r="22" 
            stroke="url(#masfeehGold)" 
            strokeWidth="1.2" 
          />

          {/* Inner Delicate Beaded/Dashed Ring */}
          <circle 
            cx="24" 
            cy="24" 
            r="19.5" 
            stroke="url(#masfeehGold)" 
            strokeWidth="0.6" 
            strokeOpacity="0.45"
            strokeDasharray="1.2 1.6"
          />

          {/* Royal Crown Crest Silhouette */}
          <path 
            d="M15.5 19.8L18.8 14.2L24 17.5L29.2 14.2L32.5 19.8C32.5 21.2 30.2 21.8 24 21.8C17.8 21.8 15.5 21.2 15.5 19.8Z" 
            fill="url(#masfeehGold)" 
          />

          {/* Crown Pearls */}
          <circle cx="18.8" cy="13.7" r="1.1" fill="#fff7e6" stroke="#997316" strokeWidth="0.4" />
          <circle cx="24" cy="16.3" r="1.3" fill="#fff7e6" stroke="#997316" strokeWidth="0.4" />
          <circle cx="29.2" cy="13.7" r="1.1" fill="#fff7e6" stroke="#997316" strokeWidth="0.4" />

          {/* Radiant 4-Point Star Diamond atop Center Crown Peak */}
          <path 
            d="M24 8L24.6 11.2L27.5 11.8L24.6 12.4L24 15.5L23.4 12.4L20.5 11.8L23.4 11.2Z" 
            fill="url(#masfeehGold)" 
          />
          <circle cx="24" cy="11.8" r="0.6" fill="#ffffff" />

          {/* Royal Serif Monogram "M" */}
          <text 
            x="24" 
            y="35" 
            fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif" 
            fontSize="14.5" 
            fontWeight="700" 
            fill="url(#masfeehGold)" 
            textAnchor="middle" 
            letterSpacing="0.02em"
          >
            M
          </text>
        </svg>
      </div>

      {/* Typography: MASFEEH & ACCESSORIZE YOUR WORLD */}
      {variant !== 'iconOnly' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span 
              className={`font-serif-luxury ${dimensions.title} font-bold tracking-[0.14em] uppercase transition-colors ${
                isDark 
                  ? 'text-[#faf5ee] group-hover:text-[#e5bf67]' 
                  : 'text-[#1e1917] group-hover:text-[#997316]'
              }`}
            >
              Masfeeh
            </span>
            <span className="text-[#c59325] text-xs transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125">
              ✦
            </span>
          </div>

          {showTagline && (
            <span 
              className={`${dimensions.subtitle} font-semibold tracking-[0.30em] uppercase mt-0.5 ${
                isDark ? 'text-[#c59325]' : 'text-[#8c7365]'
              }`}
            >
              Accessorize Your World
            </span>
          )}
        </div>
      )}
    </div>
  );
}
