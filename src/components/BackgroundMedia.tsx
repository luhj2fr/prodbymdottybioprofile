import React, { useEffect, useState } from 'react';

interface BackgroundMediaProps {
  enableScanlines?: boolean;
  enableVignette?: boolean;
  enableNoise?: boolean;
}

export const BackgroundMedia: React.FC<BackgroundMediaProps> = ({
  enableScanlines = true,
  enableVignette = true,
}) => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50, dx: 0, dy: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const xPct = Math.round((e.clientX / window.innerWidth) * 100);
      const yPct = Math.round((e.clientY / window.innerHeight) * 100);
      const dx = (e.clientX / window.innerWidth - 0.5) * 70;
      const dy = (e.clientY / window.innerHeight - 0.5) * 70;
      setMousePos({ x: xPct, y: yPct, dx, dy });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        const xPct = Math.round((e.touches[0].clientX / window.innerWidth) * 100);
        const yPct = Math.round((e.touches[0].clientY / window.innerHeight) * 100);
        const dx = (e.touches[0].clientX / window.innerWidth - 0.5) * 70;
        const dy = (e.touches[0].clientY / window.innerHeight - 0.5) * 70;
        setMousePos({ x: xPct, y: yPct, dx, dy });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div id="background-media-container" className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0 bg-[#07070b]">
      {/* Primary Dynamic Mouse-Tracking Radial Gradient */}
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-100 ease-out"
        style={{
          background: `radial-gradient(850px circle at ${mousePos.x}% ${mousePos.y}%, rgba(217, 70, 239, 0.28), transparent 60%), radial-gradient(950px circle at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(34, 211, 238, 0.24), transparent 65%), radial-gradient(1000px circle at ${mousePos.y}% ${100 - mousePos.x}%, rgba(99, 102, 241, 0.28), transparent 70%)`,
        }}
      />

      {/* Floating Fluid Glow Orbs with Parallax */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-fuchsia-600/20 blur-[130px] -top-20 -left-20 pointer-events-none transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `translate(${mousePos.dx * 0.9}px, ${mousePos.dy * 0.9}px)`,
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/18 blur-[140px] -bottom-32 -right-32 pointer-events-none transition-transform duration-500 ease-out will-change-transform"
        style={{
          transform: `translate(${-mousePos.dx * 1.1}px, ${-mousePos.dy * 1.1}px)`,
        }}
      />
      <div
        className="absolute w-[450px] h-[450px] rounded-full bg-indigo-600/18 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-700 ease-out will-change-transform"
        style={{
          transform: `translate(calc(-50% + ${mousePos.dx * 0.5}px), calc(-50% + ${mousePos.dy * 0.5}px))`,
        }}
      />

      {/* Scanline Overlay */}
      {enableScanlines && (
        <div className="absolute inset-0 scanlines-overlay opacity-20 pointer-events-none" />
      )}

      {/* Vignette Overlay */}
      {enableVignette && (
        <div className="absolute inset-0 vignette-overlay opacity-80 pointer-events-none" />
      )}
    </div>
  );
};
