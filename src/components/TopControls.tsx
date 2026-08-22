import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Sliders, 
  Share2, 
  Maximize, 
  Minimize, 
  Eye, 
  EyeOff, 
  Lock,
  Unlock,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TopControlsProps {
  volume: number;
  isMuted: boolean;
  onMuteToggle: () => void;
  onVolumeChange: (vol: number) => void;
  onOpenCustomizer: (tab?: string) => void;
  previewMode: boolean;
  onTogglePreviewMode: () => void;
  isUnlocked: boolean;
  onUnlockClick: () => void;
  onLockClick: () => void;
}

export const TopControls: React.FC<TopControlsProps> = ({
  volume,
  isMuted,
  onMuteToggle,
  onVolumeChange,
  onOpenCustomizer,
  previewMode,
  onTogglePreviewMode,
  isUnlocked,
  onUnlockClick,
  onLockClick,
}) => {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.1, x: 0.9 },
      colors: ['#ffffff', '#a855f7', '#3b82f6', '#10b981'],
    });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between pointer-events-none z-30">
      {/* Top Left: Volume & Audio Control */}
      <div className="relative pointer-events-auto flex items-center gap-2">
        <button
          id="top-volume-control-btn"
          onClick={onMuteToggle}
          onMouseEnter={() => setShowVolumeSlider(true)}
          className="w-10 h-10 rounded-xl bg-[#0a0a0e]/60 hover:bg-[#14141e]/80 backdrop-blur-xl border border-white/15 hover:border-cyan-400/40 text-white/90 hover:text-cyan-300 flex items-center justify-center transition-all duration-200 shadow-xl shadow-black/50 active:scale-95 group"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label="Volume Control"
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Floating Volume Slider on Hover */}
        {showVolumeSlider && (
          <div
            onMouseLeave={() => setShowVolumeSlider(false)}
            className="flex items-center gap-2 px-3 py-2 bg-[#0d0d14]/90 backdrop-blur-xl border border-white/15 rounded-xl animate-in fade-in slide-in-from-left-2 duration-150 shadow-xl"
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 sm:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[10px] font-mono text-cyan-300/80 w-6">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Top Right: Customizer & Quick Actions */}
      <div className="pointer-events-auto flex items-center gap-2">
        {/* Toggle Clean Preview Mode */}
        <button
          id="btn-preview-mode"
          onClick={onTogglePreviewMode}
          className="w-10 h-10 rounded-xl bg-[#0a0a0e]/60 hover:bg-[#14141e]/80 backdrop-blur-xl border border-white/15 hover:border-cyan-400/40 text-white/80 hover:text-cyan-300 flex items-center justify-center transition-all duration-200 shadow-xl active:scale-95"
          title={previewMode ? 'Exit Clean Preview' : 'Clean Preview Mode'}
        >
          {previewMode ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Share Profile */}
        <button
          id="btn-share-profile"
          onClick={handleShare}
          className="w-10 h-10 rounded-xl bg-[#0a0a0e]/60 hover:bg-[#14141e]/80 backdrop-blur-xl border border-white/15 hover:border-cyan-400/40 text-white/80 hover:text-cyan-300 flex items-center justify-center transition-all duration-200 shadow-xl active:scale-95"
          title="Copy Profile URL"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>

        {/* Fullscreen */}
        <button
          id="btn-fullscreen-toggle"
          onClick={toggleFullscreen}
          className="hidden sm:flex w-10 h-10 rounded-xl bg-[#0a0a0e]/60 hover:bg-[#14141e]/80 backdrop-blur-xl border border-white/15 hover:border-cyan-400/40 text-white/80 hover:text-cyan-300 items-center justify-center transition-all duration-200 shadow-xl active:scale-95"
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

