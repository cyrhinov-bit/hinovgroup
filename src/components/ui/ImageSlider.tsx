import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Play,
  Pause,
  Layers,
} from 'lucide-react';
import { MediaDisplay, isVideoResource } from './MediaDisplay';

export interface ImageSliderProps {
  images?: string[];
  alt?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  aspectRatioClassName?: string;
  showThumbnails?: boolean;
  showIndicators?: boolean;
  showArrows?: boolean;
  badgeLabel?: string;
  enableLightbox?: boolean;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({
  images = [],
  alt = 'Galerie HINOV Group',
  autoPlay = true,
  autoPlayInterval = 4500,
  className = '',
  aspectRatioClassName = 'aspect-[4/3]',
  showThumbnails = true,
  showIndicators = true,
  showArrows = true,
  badgeLabel,
  enableLightbox = true,
}) => {
  // Extract and clean valid non-empty media urls
  const validImages: string[] = React.useMemo(() => {
    if (!Array.isArray(images)) return [];
    return images
      .map((img) => {
        if (!img) return '';
        if (typeof img === 'string') return img.trim();
        if (typeof img === 'object' && (img as any).url) return String((img as any).url).trim();
        return '';
      })
      .filter((u) => u.length > 0 && !u.startsWith('blob:'));
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(autoPlay);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const total = validImages.length;

  // Safe fallback if images is empty
  const displayImages = total > 0 ? validImages : [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  ];
  const safeTotal = displayImages.length;

  // Reset index if out of bounds
  useEffect(() => {
    if (currentIndex >= safeTotal) {
      setCurrentIndex(0);
    }
  }, [safeTotal, currentIndex]);

  const handleNext = useCallback(() => {
    if (safeTotal <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % safeTotal);
  }, [safeTotal]);

  const handlePrev = useCallback(() => {
    if (safeTotal <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + safeTotal) % safeTotal);
  }, [safeTotal]);

  // Autoplay timer
  useEffect(() => {
    if (!isAutoPlayActive || safeTotal <= 1 || isHovered || isLightboxOpen) {
      return;
    }

    const interval = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlayActive, safeTotal, isHovered, isLightboxOpen, autoPlayInterval, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') setIsLightboxOpen(false);
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handleNext, handlePrev]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const currentMediaUrl = displayImages[currentIndex] || displayImages[0];
  const isCurrentVideo = isVideoResource(currentMediaUrl);

  return (
    <div className={`w-full flex flex-col space-y-3 ${className}`}>
      {/* Main Slider Display Container */}
      <div
        className={`group relative w-full overflow-hidden rounded-2xl bg-black shadow-xl border border-black/10 select-none ${aspectRatioClassName}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Render Slides with Crossfade Animation */}
        {displayImages.map((mediaUrl, idx) => {
          const isActive = idx === currentIndex;
          const isVideo = isVideoResource(mediaUrl);

          return (
            <div
              key={`${idx}-${mediaUrl}`}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
              }`}
            >
              {isVideo ? (
                <MediaDisplay
                  imageUrl={mediaUrl}
                  imageAlt={`${alt} - visuel ${idx + 1}`}
                  className="w-full h-full object-cover"
                  aspectRatioClassName="w-full h-full"
                  autoPlay={isActive}
                  loop={true}
                  muted={true}
                  showControls={false}
                  interactive={false}
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={`${alt} - vue ${idx + 1}/${safeTotal}`}
                  className="w-full h-full object-cover"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
          );
        })}

        {/* Ambient Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none z-20" />

        {/* Header Badges & Actions */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30">
          <div className="flex items-center gap-2">
            {badgeLabel && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-extrabold tracking-wider uppercase border border-white/10 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#4AD07B] animate-pulse" />
                {badgeLabel}
              </span>
            )}
            {safeTotal > 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-mono font-bold border border-white/10">
                <Layers size={12} className="text-[#4A94D1]" />
                {currentIndex + 1} / {safeTotal}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Play/Pause Autoplay Toggle */}
            {safeTotal > 1 && !isCurrentVideo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAutoPlayActive((prev) => !prev);
                }}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105 cursor-pointer"
                title={isAutoPlayActive ? 'Suspendre le défilement auto' : 'Activer le défilement auto'}
                aria-label={isAutoPlayActive ? 'Pause défilement' : 'Play défilement'}
              >
                {isAutoPlayActive ? <Pause size={13} /> : <Play size={13} className="translate-x-0.5" />}
              </button>
            )}

            {/* Lightbox Trigger */}
            {enableLightbox && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105 cursor-pointer"
                title="Agrandir en plein écran"
                aria-label="Plein écran"
              >
                <Maximize2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Arrows (Left / Right) */}
        {showArrows && safeTotal > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg transition-all duration-200 transform hover:scale-110 cursor-pointer"
              title="Image précédente"
              aria-label="Image précédente"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/65 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg transition-all duration-200 transform hover:scale-110 cursor-pointer"
              title="Image suivante"
              aria-label="Image suivante"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Dots Pagination Indicators */}
        {showIndicators && safeTotal > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/15">
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 h-2 bg-[#4A94D1]'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/90'
                }`}
                aria-label={`Aller au visuel ${idx + 1}`}
                title={`Visuel ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails Navigation Strip */}
      {showThumbnails && safeTotal > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {displayImages.map((imgUrl, idx) => {
            const isSelected = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-18 sm:w-20 aspect-[4/3] rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-200 cursor-pointer bg-black/5 ${
                  isSelected
                    ? 'border-[#4A94D1] ring-2 ring-[#4A94D1]/30 scale-105 shadow-md'
                    : 'border-black/10 hover:border-black/30 opacity-70 hover:opacity-100'
                }`}
                title={`Afficher le visuel #${idx + 1}`}
              >
                <img
                  src={imgUrl}
                  alt={`${alt} vignette ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                {isSelected && (
                  <span className="absolute inset-0 bg-[#4A94D1]/15 pointer-events-none" />
                )}
                <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded-md bg-black/70 text-white text-[9px] font-mono font-bold">
                  #{idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div
            className="w-full max-w-6xl flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm sm:text-base tracking-wide">
                {alt}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-mono">
                {currentIndex + 1} / {safeTotal}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Fermer (Échap)"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lightbox Center Image */}
          <div
            className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentMediaUrl}
              alt={`${alt} agrandi`}
              className="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl"
              referrerPolicy="no-referrer"
            />

            {/* Lightbox Arrows */}
            {safeTotal > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 shadow-xl transition-all hover:scale-110 cursor-pointer"
                  title="Précédent (Flèche gauche)"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 shadow-xl transition-all hover:scale-110 cursor-pointer"
                  title="Suivant (Flèche droite)"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Thumbnails */}
          {safeTotal > 1 && (
            <div
              className="flex items-center gap-2 overflow-x-auto max-w-3xl pb-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {displayImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    currentIndex === idx
                      ? 'border-[#4A94D1] scale-105'
                      : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Vignette ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
