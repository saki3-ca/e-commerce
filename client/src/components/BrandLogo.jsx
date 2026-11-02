import React from 'react';

/**
 * Masfeeh wordmark: set in Cormorant Garamond, widely tracked capitals.
 * variant: 'default' (dark text) | 'dark' (light text, for dark backgrounds) | 'iconOnly' (monogram M)
 * size: 'sm' | 'md' | 'lg'
 */
export default function BrandLogo({ variant = 'default', size = 'md', showTagline = false, className = '' }) {
  const color = variant === 'dark' ? 'text-paper' : 'text-ink';
  const sizes = {
    sm: { word: 'text-[19px]', tag: 'text-[8px]', mono: 'w-8 h-8 text-lg' },
    md: { word: 'text-[22px] sm:text-[24px]', tag: 'text-[9px]', mono: 'w-9 h-9 text-xl' },
    lg: { word: 'text-[34px] sm:text-[44px]', tag: 'text-[10px]', mono: 'w-12 h-12 text-2xl' }
  }[size] || {};

  if (variant === 'iconOnly') {
    return (
      <span
        className={`inline-flex items-center justify-center border border-current font-display ${sizes.mono} ${className}`}
        aria-label="Masfeeh"
      >
        M
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col items-center leading-none select-none ${color} ${className}`}>
      <span className={`font-display font-medium uppercase tracking-[0.32em] pl-[0.32em] ${sizes.word}`}>
        Masfeeh
      </span>
      {showTagline && (
        <span className={`mt-1.5 uppercase tracking-[0.42em] pl-[0.42em] opacity-70 ${sizes.tag}`}>
          Accessorize your world
        </span>
      )}
    </span>
  );
}
