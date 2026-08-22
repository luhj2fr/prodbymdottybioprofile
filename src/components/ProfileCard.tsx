import React, { useState } from 'react';
import { Eye, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { ProfileConfig, Track } from '../types';
import { AnimatedUsername } from './AnimatedUsername';
import { SocialIcons } from './SocialIcons';
import { AudioPlayer } from './AudioPlayer';

interface ProfileCardProps {
  config: ProfileConfig;
  isUnlocked: boolean;
  onUnlockClick: () => void;
  onTrackChange: (trackId: string) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onLoopToggle: () => void;
  onShuffleToggle: () => void;
  onAddTrack: (track: Track) => void;
  onDeleteTrack: (trackId: string) => void;
  onOpenCustomizer: (tab?: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  config,
  isUnlocked,
  onUnlockClick,
  onTrackChange,
  onVolumeChange,
  onMuteToggle,
  onLoopToggle,
  onShuffleToggle,
  onAddTrack,
  onDeleteTrack,
  onOpenCustomizer,
}) => {
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const handleAvatarClick = () => {
    if (isUnlocked) {
      onOpenCustomizer('profile');
    } else {
      onUnlockClick();
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-3.5 px-4 z-10">
      {/* Centered Main Profile Glass Card with Vibrant Palette styling */}
      <div
        id="main-profile-card"
        style={{
          backdropFilter: `blur(${config.cardBlur}px)`,
          backgroundColor: `rgba(14, 14, 20, ${config.cardOpacity / 100})`,
        }}
        className="w-full rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl shadow-black/90 relative overflow-hidden transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(34,211,238,0.15)]"
      >
        {/* Subtle Ambient Vibrant Card Glow */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none opacity-25 blur-3xl bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-cyan-500"
        />

        {/* Music Producer Status Pill Badge */}
        <div className="inline-flex items-center gap-1.5 mb-4 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Music Producer</span>
        </div>

        {/* Circular Avatar with Vibrant Gradient Ring */}
        <div className="relative mb-4 group cursor-pointer" onClick={handleAvatarClick}>
          <div 
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-[2px] bg-gradient-to-tr from-fuchsia-500 to-cyan-400 relative transition-transform duration-300 group-hover:scale-105 ${
              config.avatarGlow ? 'shadow-[0_0_30px_rgba(217,70,239,0.35)]' : 'shadow-[0_0_20px_rgba(34,211,238,0.25)]'
            }`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-black/80 flex items-center justify-center">
              {config.avatarUrl ? (
                <img
                  src={config.avatarUrl}
                  alt={config.username}
                  referrerPolicy="no-referrer"
                  onLoad={() => setAvatarLoaded(true)}
                  className={`w-full h-full object-cover rounded-full transition-opacity duration-300 ${
                    avatarLoaded ? 'opacity-100' : 'opacity-80 animate-pulse'
                  }`}
                />
              ) : (
                <span className="text-xl font-bold text-cyan-300">MD</span>
              )}
            </div>
          </div>

          {/* Verified Producer Badge */}
          <div 
            className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-black/90 border border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            title="Verified Music Producer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 fill-cyan-400 text-black" />
          </div>
        </div>

        {/* Animated Username Title (e.g. prodbymdotty) */}
        <div className="mb-2" onClick={isUnlocked ? () => onOpenCustomizer('title') : undefined}>
          <AnimatedUsername
            username={config.username}
            animation={config.titleAnimation}
            fontFamily={config.fontFamily}
            accentGlowColor={config.accentGlowColor}
            fontSize={config.fontSize}
          />
        </div>

        {/* Badges / Tags (if enabled) */}
        {config.badges.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
            {config.badges.map((b) => (
              <span
                key={b.id}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white/90 border border-white/15 hover:border-cyan-400/30 transition-colors flex items-center gap-1 shadow-sm"
              >
                {b.icon === 'flame' && <Flame className="w-3 h-3 text-orange-400 fill-orange-400/30" />}
                {b.icon === 'sparkles' && <Sparkles className="w-3 h-3 text-cyan-300" />}
                {b.text}
              </span>
            ))}
          </div>
        )}

        {/* Bio / Producer Credits Description */}
        <p className="text-gray-300 text-sm sm:text-base font-normal max-w-md leading-relaxed mb-6 select-text">
          {config.bioText}
        </p>

        {/* Social Icons Row */}
        <div className="mb-6 w-full">
          <SocialIcons links={config.socialLinks} />
        </div>

        {/* Bottom Bar inside card: Real-time View Counter */}
        <div className="w-full flex items-center justify-between text-xs text-white/50 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 font-mono text-[11px] bg-white/5 px-3 py-1 rounded-full border border-white/10 text-cyan-300/90 shadow-sm">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>{config.viewsCount.toLocaleString()} views</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Realtime synced" />
          </div>

          <span className="text-[11px] text-white/30 font-mono">
            prodbymdotty
          </span>
        </div>
      </div>

      {/* Integrated Audio Player (Positioned directly below the card as in screenshot) */}
      <AudioPlayer
        tracks={config.tracks}
        currentTrackId={config.currentTrackId}
        volume={config.volume}
        isMuted={config.isMuted}
        loopMode={config.loopMode}
        shuffle={config.shuffle}
        showVisualizer={config.showVisualizer}
        onTrackChange={onTrackChange}
        onVolumeChange={onVolumeChange}
        onMuteToggle={onMuteToggle}
        onLoopToggle={onLoopToggle}
        onShuffleToggle={onShuffleToggle}
        onAddTrack={onAddTrack}
        onDeleteTrack={onDeleteTrack}
        onOpenCustomizer={onOpenCustomizer}
      />
    </div>
  );
};
