import React, { useState } from 'react';

interface HinovLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'monochrome-white';
  showText?: boolean;
  logoSrc?: string;
}

export const HinovLogo: React.FC<HinovLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showText = true,
  logoSrc = '/assets/icon-512.png',
}) => {
  const [imgError, setImgError] = useState(false);

  const dimensionMap = {
    sm: { imgSize: 36, textSize: 'text-xl', subSize: 'text-[10px]', gap: 'gap-2.5', rounded: 'rounded-lg' },
    md: { imgSize: 44, textSize: 'text-2xl', subSize: 'text-[11px]', gap: 'gap-3', rounded: 'rounded-xl' },
    lg: { imgSize: 56, textSize: 'text-3xl', subSize: 'text-xs', gap: 'gap-3.5', rounded: 'rounded-xl' },
    xl: { imgSize: 72, textSize: 'text-4xl', subSize: 'text-sm', gap: 'gap-4', rounded: 'rounded-2xl' },
  };

  const { imgSize, textSize, subSize, gap, rounded } = dimensionMap[size];

  // SVG Fallback in the rare event image cannot load
  const renderFallbackSvg = () => (
    <svg
      width={imgSize}
      height={imgSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <circle cx="50" cy="50" r="46" fill="#111111" />
      <circle cx="50" cy="50" r="38" fill="white" />
      <text
        x="50%"
        y="58%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#111111"
        fontWeight="800"
        fontSize="28"
        fontFamily="'Outfit', sans-serif"
      >
        H
      </text>
    </svg>
  );

  const renderImage = () => {
    if (imgError) {
      return renderFallbackSvg();
    }
    return (
      <img
        src={logoSrc}
        alt="HINOV Group Logo"
        width={imgSize}
        height={imgSize}
        onError={() => setImgError(true)}
        className={`${rounded} shrink-0 object-contain shadow-2xs transition-transform duration-200 hover:scale-105`}
        style={{
          width: `${imgSize}px`,
          height: `${imgSize}px`,
        }}
        loading="eager"
        decoding="async"
      />
    );
  };

  if (variant === 'icon-only' || !showText) {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        {renderImage()}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${gap} select-none ${className}`}>
      {/* Official 512x512 Logo Image */}
      {renderImage()}

      {/* Brand Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center tracking-wide">
          <span
            className={`font-extrabold tracking-wider leading-none ${
              variant === 'monochrome-white' ? 'text-white' : 'text-[#111111]'
            } ${textSize}`}
            style={{
              fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.06em',
            }}
          >
            HINOV
          </span>
        </div>
        <div className="flex items-center pl-0.5 mt-0.5">
          <span
            className={`font-bold tracking-widest uppercase leading-tight ${
              variant === 'monochrome-white' ? 'text-white/80' : 'text-[#5F6673]'
            } ${subSize}`}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: '0.18em',
            }}
          >
            Group
          </span>
        </div>
      </div>
    </div>
  );
};

