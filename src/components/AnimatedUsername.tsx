import React, { useState, useEffect } from 'react';
import { UsernameAnimation } from '../types';

interface AnimatedUsernameProps {
  username: string;
  animation: UsernameAnimation;
  fontFamily: string;
  accentGlowColor: string;
  fontSize?: number;
  className?: string;
}

const GLYPHS = '0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/§±~';

export const AnimatedUsername: React.FC<AnimatedUsernameProps> = ({
  username,
  animation,
  fontFamily,
  accentGlowColor,
  fontSize = 36,
  className = '',
}) => {
  // Scramble / Decrypt state for 'matrix-decrypt'
  const [displayText, setDisplayText] = useState(username);
  const [isHovered, setIsHovered] = useState(false);

  // Matrix Scramble effect
  useEffect(() => {
    if (animation !== 'matrix-decrypt' && !isHovered) {
      setDisplayText(username);
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        username
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return username[index];
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join('')
      );

      if (iteration >= username.length) {
        clearInterval(interval);
      }
      iteration += 1 / 2.5;
    }, 45);

    return () => clearInterval(interval);
  }, [username, animation, isHovered]);

  const styleConfig: React.CSSProperties = {
    fontFamily: fontFamily || 'inherit',
    fontSize: `${fontSize}px`,
    color: animation === 'neon-pulse' ? accentGlowColor : undefined,
  };

  // Render different animation structures
  const renderContent = () => {
    switch (animation) {
      case 'subtle-glow':
        return (
          <span className="font-extrabold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all duration-300 hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]">
            {username}
          </span>
        );

      case 'smooth-gradient':
        return (
          <span className="font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-fuchsia-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            {username}
          </span>
        );

      case 'minimal-clean':
        return (
          <span className="font-bold tracking-tight text-white/95 hover:text-white transition-colors">
            {username}
          </span>
        );

      case 'glitch-wavy':
        return (
          <span className="anim-glitch-wavy font-bold tracking-wider relative group select-none">
            {/* Split into wavy letters with jagged glitch displacement */}
            {username.split('').map((char, idx) => (
              <span
                key={idx}
                className="letter-wave-item"
                style={{
                  animationDelay: `${idx * 0.08}s`,
                  display: 'inline-block',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
        );

      case 'wave-float':
        return (
          <span className="inline-block font-extrabold tracking-wide">
            {username.split('').map((char, idx) => (
              <span
                key={idx}
                className="letter-wave-item"
                style={{
                  animationDelay: `${idx * 0.12}s`,
                  display: 'inline-block',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </span>
        );

      case 'rgb-split':
        return (
          <span className="anim-rgb-split font-black tracking-wide inline-block">
            {username}
          </span>
        );

      case 'neon-pulse':
        return (
          <span
            className="anim-neon-pulse font-extrabold tracking-wider inline-block"
            style={{ color: accentGlowColor }}
          >
            {username}
          </span>
        );

      case 'metallic-shine':
        return (
          <span className="anim-metallic-shine font-black tracking-wide inline-block drop-shadow-md">
            {username}
          </span>
        );

      case 'fire-embers':
        return (
          <span className="anim-fire-embers font-black tracking-wide inline-block">
            {username}
          </span>
        );

      case 'retro-vcr':
        return (
          <span className="anim-retro-vcr font-bold uppercase tracking-widest inline-block text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.6)]">
            {username}
          </span>
        );

      case 'matrix-decrypt':
        return (
          <span className="font-mono font-bold tracking-wider inline-block text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.7)]">
            {displayText}
          </span>
        );

      case 'typewriter':
        return (
          <span className="font-mono font-bold tracking-wide inline-flex items-center">
            {username}
            <span className="inline-block w-2.5 h-6 bg-white ml-1 animate-pulse" />
          </span>
        );

      default:
        return (
          <span className="font-bold tracking-wide">{username}</span>
        );
    }
  };

  return (
    <div
      id="profile-username-heading"
      style={styleConfig}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-block cursor-pointer transition-transform duration-200 hover:scale-[1.03] ${className}`}
      title="Click or customize username animation"
    >
      {renderContent()}
    </div>
  );
};
