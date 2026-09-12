import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Film } from 'lucide-react';

interface MediaDisplayProps {
  mediaType?: 'image' | 'video';
  imageUrl?: string;
  imageAlt?: string;
  videoUrl?: string;
  videoPosterUrl?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  showControls?: boolean;
  className?: string;
  aspectRatioClassName?: string;
  badgeLabel?: string;
  /**
   * When false (default for visitors), the video is strictly in view-only / playback mode:
   * no pause on click, no controls, no sound toggle, no right-click menu, pointer-events-none.
   */
  interactive?: boolean;
}

// Export helper for reliable video detection across the app
export function isVideoResource(url?: string, explicitType?: 'image' | 'video'): boolean {
  if (explicitType === 'video') return true;
  if (explicitType === 'image') return false;
  if (!url || typeof url !== 'string') return false;
  const cleanUrl = url.trim().toLowerCase();
  return (
    cleanUrl.startsWith('blob:') ||
    cleanUrl.startsWith('data:video/') ||
    cleanUrl.includes('.mp4') ||
    cleanUrl.includes('.webm') ||
    cleanUrl.includes('.mov') ||
    cleanUrl.includes('.ogg') ||
    cleanUrl.includes('.m4v') ||
    cleanUrl.includes('.mkv') ||
    cleanUrl.includes('.avi') ||
    cleanUrl.includes('/videos/') ||
    cleanUrl.includes('youtube.com') ||
    cleanUrl.includes('youtu.be') ||
    cleanUrl.includes('vimeo.com') ||
    cleanUrl.includes('mixkit.co/videos')
  );
}

export const MediaDisplay: React.FC<MediaDisplayProps> = ({
  mediaType,
  imageUrl,
  imageAlt = 'Visuel HINOV Group',
  videoUrl,
  videoPosterUrl,
  autoPlay = true,
  loop = true,
  muted = true,
  showControls = false,
  className = '',
  aspectRatioClassName = 'aspect-[4/3]',
  badgeLabel,
  interactive = false, // Strictly view-only mode for visitors by default
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Auto detect if the provided resource is a video
  const isVideo =
    mediaType === 'video' ||
    Boolean(videoUrl && videoUrl.trim().length > 0) ||
    isVideoResource(imageUrl, mediaType);

  const resolvedVideoUrl = videoUrl || (isVideo ? imageUrl : undefined);
  const resolvedImageUrl = (!isVideo ? imageUrl : undefined) || videoPosterUrl;

  // Reset error state if the URL changes
  useEffect(() => {
    setHasError(false);
  }, [resolvedVideoUrl, imageUrl, videoUrl]);

  // Check if it's an external embed (YouTube / Vimeo)
  const isYouTube = Boolean(
    resolvedVideoUrl &&
      (resolvedVideoUrl.includes('youtube.com') || resolvedVideoUrl.includes('youtu.be'))
  );
  const isVimeo = Boolean(resolvedVideoUrl && resolvedVideoUrl.includes('vimeo.com'));

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0] || '';
    } else if (url.includes('/shorts/')) {
      videoId = url.split('/shorts/')[1]?.split('?')[0] || '';
    } else if (url.includes('/embed/')) {
      videoId = url.split('/embed/')[1]?.split('?')[0] || '';
    }
    // Strictly disable controls, keyboard and branding for non-interactive playback mode
    const controlsParam = interactive ? 1 : 0;
    const disableKb = interactive ? 0 : 1;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=${controlsParam}&disablekb=${disableKb}&modestbranding=1&rel=0&playsinline=1`;
  };

  const getVimeoEmbedUrl = (url: string) => {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0] || '';
    const controlsParam = interactive ? 1 : 0;
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&controls=${controlsParam}&background=${interactive ? 0 : 1}`;
  };

  // Autoplay & continuous playback assurance for visitors
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const playVideo = () => {
      if (videoRef.current) {
        const promise = videoRef.current.play();
        if (promise !== undefined) {
          promise
            .then(() => setIsPlaying(true))
            .catch(() => {
              // Retry on first document interaction if browser blocked muted autoplay
              const unlockAutoplay = () => {
                if (videoRef.current) {
                  videoRef.current.play().catch(() => {});
                }
                window.removeEventListener('click', unlockAutoplay);
                window.removeEventListener('touchstart', unlockAutoplay);
                window.removeEventListener('scroll', unlockAutoplay);
              };
              window.addEventListener('click', unlockAutoplay, { once: true });
              window.addEventListener('touchstart', unlockAutoplay, { once: true });
              window.addEventListener('scroll', unlockAutoplay, { once: true });
            });
        }
      }
    };

    playVideo();

    // IntersectionObserver to ensure playback continues smoothly whenever in view
    let observer: IntersectionObserver | null = null;
    if (containerRef.current && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && videoRef.current) {
              videoRef.current.play().catch(() => {});
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [resolvedVideoUrl]);

  // If interactive mode is disabled, instantly resume if paused
  const handlePause = () => {
    if (!interactive && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(false);
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (!interactive) return; // Disallow interaction in visitor mode
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    }
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (!interactive) return; // Disallow interaction in visitor mode
    if (e) e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // If not video or if video had a fatal loading error, display image fallback
  if (!isVideo || hasError || !resolvedVideoUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gray-100 ${aspectRatioClassName} ${className}`}
      >
        <img
          src={
            resolvedImageUrl ||
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80'
          }
          alt={imageAlt}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {badgeLabel && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold tracking-wide">
            {badgeLabel}
          </span>
        )}
      </div>
    );
  }

  // If YouTube / Vimeo embed
  if (isYouTube || isVimeo) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-black select-none ${aspectRatioClassName} ${className}`}
      >
        <iframe
          src={isYouTube ? getYouTubeEmbedUrl(resolvedVideoUrl) : getVimeoEmbedUrl(resolvedVideoUrl)}
          title={imageAlt || 'Vidéo HINOV Group'}
          className={`w-full h-full border-0 ${!interactive ? 'pointer-events-none' : ''}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          tabIndex={-1}
        />

        {/* Shield overlay preventing visitor clicks / pauses on embedded videos */}
        {!interactive && (
          <div
            className="absolute inset-0 z-20 cursor-default bg-transparent"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
        )}

        {badgeLabel && (
          <span className="absolute top-3 left-3 z-30 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-bold tracking-wide flex items-center gap-1.5 pointer-events-none">
            <Film size={12} className="text-[#4AD07B]" />
            {badgeLabel}
          </span>
        )}
      </div>
    );
  }

  // Native HTML5 video player in playback-only mode for visitors
  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={interactive ? () => togglePlay() : undefined}
      onContextMenu={(e) => e.preventDefault()}
      className={`group relative overflow-hidden rounded-2xl bg-black/95 select-none ${
        interactive ? 'cursor-pointer' : 'cursor-default'
      } ${aspectRatioClassName} ${className}`}
    >
      <video
        ref={videoRef}
        key={resolvedVideoUrl}
        src={resolvedVideoUrl}
        poster={videoPosterUrl || undefined}
        autoPlay={true}
        loop={true}
        muted={true}
        playsInline={true}
        preload="auto"
        disablePictureInPicture={true}
        disableRemotePlayback={true}
        controls={false}
        tabIndex={-1}
        aria-hidden="true"
        onContextMenu={(e) => e.preventDefault()}
        onError={(e) => {
          console.warn('Video load notification:', resolvedVideoUrl, e);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={handlePause}
        className="w-full h-full object-cover pointer-events-none select-none"
      />

      {/* Transparent visitor shield blocking clicks, touch pauses and context menus */}
      {!interactive && (
        <div
          className="absolute inset-0 z-20 cursor-default bg-transparent select-none"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => e.preventDefault()}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            // Keep playback continuous on mobile touches
            if (videoRef.current && videoRef.current.paused) {
              videoRef.current.play().catch(() => {});
            }
          }}
        />
      )}

      {/* Video Overlay Gradient for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none transition-opacity duration-300 z-10" />

      {/* Top badges (Ambient indicator) */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-extrabold tracking-wider uppercase border border-white/10 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#4AD07B] animate-pulse" />
          {badgeLabel || 'En continu • HINOV'}
        </span>

        {/* Accessible Mute / Unmute button for all visitors */}
        <button
          type="button"
          onClick={toggleMute}
          className={`pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 backdrop-blur-md border shadow-md cursor-pointer ${
            isMuted
              ? 'bg-black/75 hover:bg-black text-white/90 border-white/20 hover:scale-105 hover:border-white/40'
              : 'bg-[#4AD07B] hover:bg-[#3ebe6d] text-white border-white/30 shadow-[#4AD07B]/30'
          }`}
          title={isMuted ? 'Cliquer pour activer le son' : 'Cliquer pour couper le son'}
          aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
        >
          {isMuted ? (
            <>
              <VolumeX size={14} className="text-red-400 shrink-0" />
              <span className="text-[11px] font-semibold tracking-wide">Activer le son</span>
            </>
          ) : (
            <>
              <Volume2 size={14} className="text-white shrink-0 animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wide">Son activé</span>
            </>
          )}
        </button>
      </div>

      {/* Center play/pause indicator button ONLY if interactive mode is explicitly enabled */}
      {interactive && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 pointer-events-none z-30 ${
            !isPlaying || isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            type="button"
            onClick={togglePlay}
            className="pointer-events-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#4A94D1]/90 hover:bg-[#3573A8] text-white flex items-center justify-center shadow-xl backdrop-blur-sm border-2 border-white/40 transition-all transform hover:scale-110"
            title={isPlaying ? 'Mettre en pause' : 'Lire la vidéo'}
          >
            {isPlaying ? (
              <Pause size={26} className="fill-white" />
            ) : (
              <Play size={26} className="fill-white translate-x-0.5" />
            )}
          </button>
        </div>
      )}

      {/* Bottom bar with status and fullscreen ONLY if interactive mode is explicitly enabled */}
      {interactive && showControls && (
        <div
          className={`absolute bottom-3 left-3 right-3 flex items-center justify-between transition-opacity duration-300 pointer-events-none z-30 ${
            isHovered || !isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/90 font-medium px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs">
              {isPlaying ? 'Lecture continue' : 'En pause'}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center border border-white/20 transition-all hover:scale-105"
              title="Plein écran"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
