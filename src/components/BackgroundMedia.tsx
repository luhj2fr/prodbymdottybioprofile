import React, { useRef, useEffect, useState } from 'react';
import { BackgroundPreset } from '../types';

interface BackgroundMediaProps {
  backgroundType: 'video' | 'image';
  backgroundUrl: string;
  bgBrightness: number;
  bgBlur: number;
  enableScanlines: boolean;
  enableVignette: boolean;
  enableNoise: boolean;
  preset?: BackgroundPreset;
}

export const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  backgroundType,
  backgroundUrl,
  bgBrightness,
  bgBlur,
  enableScanlines,
  enableVignette,
  enableNoise,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoError, setVideoError] = useState<boolean>(false);

  useEffect(() => {
    setVideoError(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay may need muted
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch((err) => console.log('Video autoplay note:', err));
        }
      });
    }
  }, [backgroundUrl, backgroundType]);

  return (
    <div id="background-media-container" className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Media Layer (Video or Image) */}
      {backgroundType === 'video' && backgroundUrl && !videoError ? (
        <video
          ref={videoRef}
          src={backgroundUrl || undefined}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoError(true)}
          style={{
            filter: `brightness(${bgBrightness}) blur(${bgBlur}px) contrast(1.15) grayscale(0.85)`,
          }}
          className="absolute inset-0 w-full h-full object-cover scale-105 transition-all duration-700 ease-out"
        />
      ) : (
        <div
          style={{
            backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
            filter: `brightness(${bgBrightness}) blur(${bgBlur}px) contrast(1.15) grayscale(0.85)`,
          }}
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat scale-105 transition-all duration-700 ease-out"
        />
      )}

      {/* Dark Ambient & Vibrant Palette Gradient Layers */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-purple-950/50 via-[#0a0a0c]/85 to-blue-950/50 mix-blend-multiply pointer-events-none" 
      />
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none" 
      />
      <div 
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" 
      />

      {/* CRT Scanline Overlay */}
      {enableScanlines && (
        <div className="absolute inset-0 scanlines-overlay opacity-30 mix-blend-overlay pointer-events-none" />
      )}

      {/* Vignette Overlay */}
      {enableVignette && (
        <div className="absolute inset-0 vignette-overlay opacity-90 pointer-events-none" />
      )}

      {/* Grain / Noise Overlay */}
      {enableNoise && (
        <div className="absolute inset-0 noise-overlay opacity-20 pointer-events-none" />
      )}
    </div>
  );
};
