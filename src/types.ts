export type UsernameAnimation =
  | 'subtle-glow'
  | 'smooth-gradient'
  | 'minimal-clean'
  | 'wave-float'
  | 'glitch-wavy'
  | 'rgb-split'
  | 'neon-pulse'
  | 'matrix-decrypt'
  | 'metallic-shine'
  | 'fire-embers'
  | 'typewriter'
  | 'retro-vcr';

export interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
  duration: number; // in seconds
  startOffset?: number; // trim offset in seconds
  coverArt?: string;
  isUploaded?: boolean;
  isCustomUrl?: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon: 'youtube' | 'discord' | 'instagram' | 'spotify' | 'soundcloud' | 'twitter' | 'tiktok' | 'beatstars' | 'mail' | 'globe';
  enabled: boolean;
}

export interface ProfileBadge {
  id: string;
  text: string;
  icon?: string;
  color?: string;
}

export interface BackgroundPreset {
  id: string;
  name: string;
  type: 'video' | 'image';
  url: string;
  thumbnail: string;
  description: string;
}

export interface ProfileConfig {
  username: string;
  titleAnimation: UsernameAnimation;
  fontFamily: string;
  fontSize: number; // 24 to 56
  accentGlowColor: string;
  bioText: string;
  avatarUrl: string;
  avatarGlow: boolean;
  viewsCount: number;
  
  // Background
  backgroundType: 'video' | 'image';
  backgroundUrl: string;
  backgroundPresetId: string;
  bgBrightness: number; // 0.1 to 1.0
  bgBlur: number; // 0 to 20 px
  enableScanlines: boolean;
  enableVignette: boolean;
  enableNoise: boolean;
  
  // Audio & Tracks
  tracks: Track[];
  currentTrackId: string;
  volume: number; // 0 to 1
  isMuted: boolean;
  loopMode: 'all' | 'one' | 'off';
  shuffle: boolean;
  showVisualizer: boolean;
  
  // Social Links & Badges
  socialLinks: SocialLink[];
  badges: ProfileBadge[];
  
  // Experience & Permissions
  requireClickToEnter: boolean;
  adminPin: string; // PIN for owner to unlock edit mode
  cardOpacity: number; // 20 to 95%
  cardBlur: number; // 4 to 30px
}
