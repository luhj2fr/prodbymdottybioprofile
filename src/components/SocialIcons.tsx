import React, { useState } from 'react';
import { 
  Youtube, 
  Instagram, 
  Twitter, 
  Mail, 
  Globe, 
  Music2, 
  Check, 
  Copy,
  ExternalLink
} from 'lucide-react';
import { SocialLink } from '../types';

interface SocialIconsProps {
  links: SocialLink[];
  className?: string;
}

// Custom Discord SVG Icon
const DiscordIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// Custom Spotify SVG Icon
const SpotifyIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.502 17.31c-.218.358-.679.473-1.037.255-2.842-1.737-6.42-2.13-10.635-1.168-.408.093-.815-.164-.908-.572-.093-.408.164-.815.572-.908 4.618-1.056 8.577-.615 11.753 1.328.358.218.473.679.255 1.037zm1.468-3.262c-.274.446-.86.588-1.306.314-3.254-2-8.215-2.58-12.064-1.411-.497.151-1.026-.134-1.177-.63-.15-.497.134-1.026.63-1.177 4.412-1.339 9.877-.701 13.603 1.598.446.274.588.86.314 1.306zm.126-3.41c-3.902-2.317-10.334-2.53-14.073-1.394-.598.182-1.233-.16-1.415-.758-.182-.598.16-1.233.758-1.415 4.303-1.306 11.405-1.054 15.894 1.611.538.319.713 1.018.394 1.556-.319.538-1.018.713-1.558.394z"/>
  </svg>
);

// Custom Soundcloud SVG Icon
const SoundCloudIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
  >
    <path d="M11.56 8.87V17h9.09c1.85 0 3.35-1.5 3.35-3.35 0-1.79-1.41-3.26-3.18-3.34-.33-2.61-2.55-4.63-5.26-4.63-1.63 0-3.08.73-4 1.88v1.31zm-2.06-1.18c-.28 0-.5.22-.5.5v8.31c0 .28.22.5.5.5s.5-.22.5-.5V8.19c0-.28-.22-.5-.5-.5zm-2.07 1.8c-.28 0-.5.22-.5.5v6.51c0 .28.22.5.5.5s.5-.22.5-.5V9.99c0-.28-.22-.5-.5-.5zm-2.06 1.25c-.28 0-.5.22-.5.5v5.26c0 .28.22.5.5.5s.5-.22.5-.5v-5.26c0-.28-.22-.5-.5-.5zm-2.07 1.15c-.28 0-.5.22-.5.5v4.11c0 .28.22.5.5.5s.5-.22.5-.5v-4.11c0-.28-.22-.5-.5-.5zm-2.06 1.48c-.28 0-.5.22-.5.5v2.63c0 .28.22.5.5.5s.5-.22.5-.5v-2.63c0-.28-.22-.5-.5-.5z"/>
  </svg>
);

export const SocialIcons: React.FC<SocialIconsProps> = ({ links, className = '' }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'discord':
        return <DiscordIcon className="w-5 h-5" />;
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'spotify':
        return <SpotifyIcon className="w-5 h-5" />;
      case 'soundcloud':
        return <SoundCloudIcon className="w-5 h-5" />;
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'mail':
        return <Mail className="w-5 h-5" />;
      case 'beatstars':
      case 'music':
        return <Music2 className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const handleClick = (link: SocialLink, e: React.MouseEvent) => {
    if (link.platform.toLowerCase() === 'discord' && !link.url.startsWith('http')) {
      e.preventDefault();
      navigator.clipboard.writeText(link.url);
      setCopiedId(link.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getPlatformHoverStyle = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'spotify':
        return 'hover:bg-[#1db954] hover:text-black hover:border-[#1db954] hover:shadow-[0_0_20px_rgba(29,185,84,0.6)]';
      case 'soundcloud':
        return 'hover:bg-[#ff5500] hover:text-white hover:border-[#ff5500] hover:shadow-[0_0_20px_rgba(255,85,0,0.6)]';
      case 'youtube':
        return 'hover:bg-[#ff0000] hover:text-white hover:border-[#ff0000] hover:shadow-[0_0_20px_rgba(255,0,0,0.6)]';
      case 'discord':
        return 'hover:bg-[#5865F2] hover:text-white hover:border-[#5865F2] hover:shadow-[0_0_20px_rgba(88,101,242,0.6)]';
      case 'instagram':
        return 'hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white hover:border-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]';
      case 'twitter':
        return 'hover:bg-[#1da1f2] hover:text-white hover:border-[#1da1f2] hover:shadow-[0_0_20px_rgba(29,161,242,0.6)]';
      default:
        return 'hover:bg-cyan-400 hover:text-black hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]';
    }
  };

  return (
    <div id="profile-social-links-row" className={`flex items-center justify-center flex-wrap gap-3 sm:gap-4 ${className}`}>
      {links
        .filter((l) => l.enabled)
        .map((link) => {
          const isCopied = copiedId === link.id;
          const isDiscordTag = link.platform.toLowerCase() === 'discord' && !link.url.startsWith('http');
          const hoverStyle = getPlatformHoverStyle(link.platform);

          return (
            <div key={link.id} className="relative group">
              <a
                href={link.url.startsWith('http') || link.url.startsWith('mailto:') ? link.url : '#'}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                onClick={(e) => handleClick(link, e)}
                className={`w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl text-white/90 flex items-center justify-center transition-all duration-300 transform hover:scale-115 active:scale-95 shadow-md shadow-black/40 border border-white/15 ${hoverStyle}`}
                title={`${link.label} (${link.url})`}
                aria-label={link.label}
              >
                {isCopied ? <Check className="w-5 h-5 text-emerald-300" /> : getIcon(link.icon)}
              </a>

              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[11px] font-medium py-0.5 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-white/10 shadow-lg z-20 flex items-center gap-1">
                {isCopied ? 'Copied to clipboard!' : link.label}
                {isDiscordTag && !isCopied && <Copy className="w-2.5 h-2.5 opacity-60 ml-0.5" />}
                {link.url.startsWith('http') && <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />}
              </div>
            </div>
          );
        })}
    </div>
  );
};
