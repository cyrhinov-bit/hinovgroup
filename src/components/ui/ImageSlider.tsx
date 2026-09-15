import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  images: string[];
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
  // Clean valid non-empty media urls
  const validImages = Array.isArray(images)
    ? images.map((img) => (typeof img === 'string' ? img.trim() : '')).filter(Boolean)
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAutoPlayActive, setIsAutoPlayActive] = useState(autoPlay);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const total = validImages.length;

  // Reset index if it exceeds total
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Autoplay timer
  useEffect(() => {
    if (!isAutoPlayActive || total <= 1 || isHovered || isLightboxOpen) {
      return;
    }

    const interval = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlayActive, total, isHovered, isLightboxOpen, autoPlayInterval, handleNext]);

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
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  // If no image is provided, display standard placeholder
  if (total === 0) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gray-100 border border-black/10 ${aspectRatioClassName} ${className}`}
      >
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
          alt={alt}
          className="w-full h-full object-cover"
        />
        {badgeLabel && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold">
            {badgeLabel}
          </span>
        )}
      </div>
    );
  }

  const currentMediaUrl = validImages[currentIndex] || validImages[0];
  const isCurrentVideo = isVideoResource(currentMediaUrl);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Slider Display */}
      <div
        className={`group relative overflow-hidden rounded-2xl bg-black shadow-xl border border-black/10 select-none ${aspectRatioClassName}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Render Active Slide */}
        <div className="w-full h-full relative">
          <MediaDisplay
            key={`slide-${currentIndex}-${currentMediaUrl}`}
            imageUrl={currentMediaUrl}
            imageAlt={`${alt} - vue ${currentIndex + 1}/${total}`}
            className="w-full h-full object-cover transition-opacity duration-500 ease-in-out"
            aspectRatioClassName="h-full w-full"
            autoPlay={true}
            loop={true}
            muted={true}
            showControls={false}
            interactive={false}
          />
        </div>

        {/* Top Badges & Controls Header */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30">
          <div className="flex items-center gap-2">
            {badgeLabel && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-extrabold tracking-wider uppercase border border-white/10 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#4AD07B] animate-pulse" />
                {badgeLabel}
              </span>
            )}
            {total > 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-mono font-bold border border-white/10">
                <Layers size={12} className="text-[#4A94D1]" />
                {currentIndex + 1} / {total}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Play/Pause Autoplay Toggle if multiple slides */}
            {total > 1 && !isCurrentVideo && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAutoPlayActive((prev) => !prev);
                }}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105 cursor-pointer"
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
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105 cursor-pointer"
                title="Agrandir en plein écran"
                aria-label="Plein écran"
              >
                <Maximize2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Arrows (Left / Right) */}
        {showArrows && total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg transition-all duration-200 transform hover:scale-110 opacity-80 group-hover:opacity-100 cursor-pointer"
              title="Image précédente"
              aria-label="Image précédente"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg transition-all duration-200 transform hover:scale-110 opacity-80 group-hover:opacity-100 cursor-pointer"
              title="Image suivante"
              aria-label="Image suivante"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Dots Pagination Indicators */}
        {showIndicators && total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
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
      {showThumbnails && total > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {validImages.map((imgUrl, idx) => {
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

      {/* Lightbox Modal */}
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
                {currentIndex + 1} / {total}
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
            />

            {/* Lightbox Arrows */}
            {total > 1 && (
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
          {total > 1 && (
            <div
              className="flex items-center gap-2 overflow-x-auto max-w-3xl pb-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {validImages.map((imgUrl, idx) => (
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
