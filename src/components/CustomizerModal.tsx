import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Video, 
  Music, 
  User, 
  Share2, 
  Upload, 
  Link as LinkIcon, 
  RotateCcw, 
  Check, 
  Sliders, 
  Plus, 
  Trash2,
  Tv,
  Film,
  Type,
  Lock,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { ProfileConfig, UsernameAnimation, Track, SocialLink } from '../types';
import { BACKGROUND_PRESETS } from '../utils/backgroundPresets';
import { DEFAULT_TRACKS } from '../utils/audioPresets';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProfileConfig;
  onUpdateConfig: (updater: Partial<ProfileConfig> | ((prev: ProfileConfig) => Partial<ProfileConfig>)) => void;
  initialTab?: string;
  onLockPage?: () => void;
}

const ANIMATION_OPTIONS: { id: UsernameAnimation; label: string; desc: string }[] = [
  { id: 'subtle-glow', label: 'Subtle Luminous Glow (Simple & Sleek)', desc: 'Crisp high-contrast typography with a soft neon aura' },
  { id: 'smooth-gradient', label: 'Smooth Gradient Shimmer', desc: 'Vibrant cyan-white-fuchsia gradient reflection' },
  { id: 'minimal-clean', label: 'Minimal & Clean', desc: 'Pure typography with sleek modern tracking' },
  { id: 'wave-float', label: 'Wave Floating', desc: 'Smooth sinusoidal character undulation' },
  { id: 'glitch-wavy', label: 'Glitch & Wavy', desc: 'Jagged digital slicing with wavy offsets' },
  { id: 'rgb-split', label: 'RGB Chromatic Split', desc: 'Neon cyan & magenta chromatic displacement' },
  { id: 'neon-pulse', label: 'Neon Electric Pulse', desc: 'Pulsing high-voltage aura with customizable color' },
  { id: 'matrix-decrypt', label: 'Matrix Decrypting', desc: 'Real-time glyph decrypting character stream' },
  { id: 'metallic-shine', label: 'Liquid Chrome Shimmer', desc: 'Specular metallic chrome linear sweep' },
  { id: 'fire-embers', label: 'Fire & Hot Embers', desc: 'Deep warm fire glow and heat ripples' },
  { id: 'retro-vcr', label: 'VHS Tracking Jitter', desc: 'Analog tape sync tracking artifacts' },
  { id: 'typewriter', label: 'Typewriter Cursor', desc: 'Cycling text typing with glowing terminal block' },
];

const FONT_OPTIONS = [
  { label: 'Rubik Glitch (Ultra Aesthetic)', value: "'Rubik Glitch', cursive" },
  { label: 'Syne (Bold Modern Producer)', value: "'Syne', sans-serif" },
  { label: 'Cinzel (Dark Gothic Luxury)', value: "'Cinzel', serif" },
  { label: 'Orbitron (Futuristic Cyber)', value: "'Orbitron', sans-serif" },
  { label: 'Unifraktur (Old English Underground)', value: "'UnifrakturMaguntia', cursive" },
  { label: 'Silkscreen (8-Bit Digital)', value: "'Silkscreen', cursive" },
  { label: 'Space Grotesk (Sharp Industrial)', value: "'Space Grotesk', sans-serif" },
  { label: 'Montserrat (Classic Clean)', value: "'Montserrat', sans-serif" },
];

const ACCENT_COLORS = [
  { name: 'Pure White', value: '#ffffff' },
  { name: 'Cyber Cyan', value: '#06b6d4' },
  { name: 'Neon Purple', value: '#c084fc' },
  { name: 'Electric Emerald', value: '#34d399' },
  { name: 'Flame Amber', value: '#f97316' },
  { name: 'Hyper Pink', value: '#f43f5e' },
  { name: 'Acid Lime', value: '#a3e635' },
  { name: 'Royal Blue', value: '#3b82f6' },
];

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  initialTab = 'title',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('prodbymdotty');
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

  const audioUploadInputRef = useRef<HTMLInputElement | null>(null);
  const videoUploadInputRef = useRef<HTMLInputElement | null>(null);
  const avatarUploadInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle Video Upload (MP4 / WebM)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    onUpdateConfig({
      backgroundType: 'video',
      backgroundUrl: objectUrl,
      backgroundPresetId: 'custom-video',
    });
  };

  // Handle Audio File Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const newTrack: Track = {
      id: `uploaded-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'prodbymdotty (Uploaded)',
      src: objectUrl,
      duration: 180,
      isUploaded: true,
    };
    onUpdateConfig((prev) => ({
      tracks: [newTrack, ...prev.tracks],
      currentTrackId: newTrack.id,
    }));
  };

  // Handle Avatar Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    onUpdateConfig({ avatarUrl: objectUrl });
  };

  // Add Track from URL
  const handleAddTrackFromUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackUrl.trim()) return;

    const newTrack: Track = {
      id: `custom-track-${Date.now()}`,
      title: newTrackTitle.trim() || 'Custom Track',
      artist: newTrackArtist.trim() || 'prodbymdotty',
      src: newTrackUrl.trim(),
      duration: 180,
      isCustomUrl: true,
    };

    onUpdateConfig((prev) => ({
      tracks: [...prev.tracks, newTrack],
      currentTrackId: newTrack.id,
    }));

    setNewTrackTitle('');
    setNewTrackUrl('');
  };

  // Reset to default
  const handleResetToDefaults = () => {
    if (confirm('Reset profile settings to default prodbymdotty configuration?')) {
      onUpdateConfig({
        username: 'prodbymdotty',
        titleAnimation: 'glitch-wavy',
        fontFamily: "'Rubik Glitch', cursive",
        fontSize: 38,
        accentGlowColor: '#ffffff',
        bioText: '💿 : Merck, Lil Rae, Gravon, Johnny Slime, Duoto, Roddy Treyy, Babyy Bumpstock, Corey Cartel, Lil Moneyy, NSG Feezy, PGF Omerta, TreTooWavy,+ More',
        avatarUrl: 'https://cdn.discordapp.com/attachments/1441138359266447446/1540575677974052894/content.png?ex=6a8a7468&is=6a8922e8&hm=aa2d054d6948ea744122cb9f006ce5d887a1255da187d0749975fe562d7d81d3&',
        backgroundType: 'video',
        backgroundUrl: BACKGROUND_PRESETS[0].url,
        backgroundPresetId: BACKGROUND_PRESETS[0].id,
        bgBrightness: 0.85,
        bgBlur: 0,
        enableScanlines: true,
        enableVignette: true,
        enableNoise: true,
        tracks: DEFAULT_TRACKS,
        currentTrackId: DEFAULT_TRACKS[0].id,
        cardOpacity: 40,
        cardBlur: 16,
      });
    }
  };

  return (
    <div 
      id="profile-customizer-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        id="profile-customizer-modal-panel"
        className="w-full max-w-2xl bg-neutral-950 border border-white/15 rounded-3xl shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-white" />
            <h3 className="text-base font-bold text-white tracking-wide">Customize Profile Webpage</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-black/40 overflow-x-auto px-4 gap-1">
          {[
            { id: 'title', label: 'Title & Animation', icon: Sparkles },
            { id: 'background', label: 'Background (Video/Img)', icon: Video },
            { id: 'audio', label: 'Music & Tracks', icon: Music },
            { id: 'profile', label: 'Profile & Bio', icon: User },
            { id: 'socials', label: 'Socials & Links', icon: Share2 },
            { id: 'security', label: 'Owner PIN & Views', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-white text-white bg-white/5'
                    : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Container */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-white/90 text-sm">
          
          {/* TAB 1: TITLE & ANIMATION */}
          {activeTab === 'title' && (
            <div className="space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Profile Username
                </label>
                <input
                  type="text"
                  value={config.username}
                  onChange={(e) => onUpdateConfig({ username: e.target.value })}
                  placeholder="e.g. prodbymdotty"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-white/50"
                />
              </div>

              {/* Title Animation Styles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Username Title Animation Style
                  </label>
                  <span className="text-xs text-emerald-400 font-mono">Live effect active</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ANIMATION_OPTIONS.map((anim) => {
                    const isSelected = config.titleAnimation === anim.id;
                    return (
                      <button
                        key={anim.id}
                        onClick={() => onUpdateConfig({ titleAnimation: anim.id })}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-white/20 border-white text-white shadow-lg'
                            : 'bg-white/5 border-white/10 hover:border-white/25 text-white/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-xs text-white">{anim.label}</p>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <p className="text-[11px] text-white/50">{anim.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Family Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Typography / Font Style
                </label>
                <select
                  value={config.fontFamily}
                  onChange={(e) => onUpdateConfig({ fontFamily: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-white/50"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value} className="bg-neutral-900 text-white">
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size & Glow Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold uppercase tracking-wider text-white/70">Font Size</label>
                    <span className="font-mono text-white/50">{config.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="52"
                    value={config.fontSize}
                    onChange={(e) => onUpdateConfig({ fontSize: parseInt(e.target.value) })}
                    className="w-full accent-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                    Accent / Glow Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => onUpdateConfig({ accentGlowColor: c.value })}
                        className={`w-6 h-6 rounded-full border transition-transform ${
                          config.accentGlowColor === c.value ? 'scale-125 border-white shadow-md' : 'border-transparent hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKGROUND (VIDEO & IMAGE) */}
          {activeTab === 'background' && (
            <div className="space-y-6">
              {/* Upload Custom Video Clip */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-white" />
                  <p className="text-xs font-bold uppercase tracking-wider text-white">
                    Put a Video Clip as Background
                  </p>
                </div>
                <p className="text-xs text-white/60">
                  Upload any looping MP4 / WebM video clip directly from your computer, or paste a video URL.
                </p>

                {/* Upload Video File Button */}
                <input
                  ref={videoUploadInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => videoUploadInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  Upload Local Video File (MP4/WebM)
                </button>

                {/* Or Video URL */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="url"
                      placeholder="Paste direct video URL (https://.../clip.mp4)"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (videoUrlInput.trim()) {
                        onUpdateConfig({
                          backgroundType: 'video',
                          backgroundUrl: videoUrlInput.trim(),
                          backgroundPresetId: 'custom-video',
                        });
                        setVideoUrlInput('');
                      }
                    }}
                    className="px-4 py-2 bg-white text-black font-semibold rounded-xl text-xs hover:bg-white/90 transition-colors"
                  >
                    Apply Video URL
                  </button>
                </div>
              </div>

              {/* Background Preset Library */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                  Curated Background Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {BACKGROUND_PRESETS.map((preset) => {
                    const isSelected = config.backgroundPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          onUpdateConfig({
                            backgroundType: preset.type,
                            backgroundUrl: preset.url,
                            backgroundPresetId: preset.id,
                          });
                        }}
                        className={`relative rounded-xl overflow-hidden border text-left p-1.5 transition-all group ${
                          isSelected
                            ? 'border-white ring-2 ring-white/30 bg-white/20'
                            : 'border-white/15 bg-black/40 hover:border-white/40'
                        }`}
                      >
                        <div className="w-full h-20 rounded-lg overflow-hidden relative mb-1.5">
                          <img
                            src={preset.thumbnail}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white/90">
                            {preset.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-white truncate">{preset.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Atmosphere Filters */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                  Atmosphere & Overlay Effects
                </label>

                {/* Brightness & Blur */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span>Brightness / Dimming</span>
                      <span className="font-mono text-white/50">{Math.round(config.bgBrightness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={config.bgBrightness}
                      onChange={(e) => onUpdateConfig({ bgBrightness: parseFloat(e.target.value) })}
                      className="w-full accent-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span>Background Blur</span>
                      <span className="font-mono text-white/50">{config.bgBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={config.bgBlur}
                      onChange={(e) => onUpdateConfig({ bgBlur: parseInt(e.target.value) })}
                      className="w-full accent-white"
                    />
                  </div>
                </div>

                {/* Overlay Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={config.enableScanlines}
                      onChange={(e) => onUpdateConfig({ enableScanlines: e.target.checked })}
                      className="rounded accent-white"
                    />
                    <span className="text-xs text-white">CRT Scanlines</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={config.enableVignette}
                      onChange={(e) => onUpdateConfig({ enableVignette: e.target.checked })}
                      className="rounded accent-white"
                    />
                    <span className="text-xs text-white">Dark Vignette</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={config.enableNoise}
                      onChange={(e) => onUpdateConfig({ enableNoise: e.target.checked })}
                      className="rounded accent-white"
                    />
                    <span className="text-xs text-white">Film Noise</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MUSIC & TRACKS */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Add Custom Background Song */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-white">
                  Add Any Song for Background
                </p>

                <input
                  ref={audioUploadInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
                <button
                  onClick={() => audioUploadInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  Upload MP3 / WAV Audio File
                </button>

                {/* Form to add URL */}
                <form onSubmit={handleAddTrackFromUrl} className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Track Title (e.g. 300 Bond Beat)"
                      value={newTrackTitle}
                      onChange={(e) => setNewTrackTitle(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                    />
                    <input
                      type="text"
                      placeholder="Artist (prodbymdotty)"
                      value={newTrackArtist}
                      onChange={(e) => setNewTrackArtist(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Direct Audio Stream URL (https://.../song.mp3)"
                      value={newTrackUrl}
                      onChange={(e) => setNewTrackUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-white text-black font-semibold rounded-xl text-xs hover:bg-white/90 transition-colors"
                    >
                      Add URL
                    </button>
                  </div>
                </form>
              </div>

              {/* Playlist Tracks List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Current Tracklist ({config.tracks.length})
                  </label>
                  <span className="text-[11px] text-white/50">Click to set active playing track</span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {config.tracks.map((t, idx) => {
                    const isSelected = t.id === config.currentTrackId;
                    return (
                      <div
                        key={t.id}
                        onClick={() => onUpdateConfig({ currentTrackId: t.id })}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white/20 border-white text-white font-medium'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-white/25 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="w-4 text-center font-mono text-[11px] text-white/40">{idx + 1}</span>
                          <div className="truncate">
                            <p className="font-semibold truncate">{t.title}</p>
                            <p className="text-[10px] text-white/50 truncate">{t.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-md bg-white text-black text-[10px] font-bold">
                              ACTIVE
                            </span>
                          )}
                          {config.tracks.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateConfig((prev) => ({
                                  tracks: prev.tracks.filter((track) => track.id !== t.id),
                                  currentTrackId:
                                    prev.currentTrackId === t.id
                                      ? prev.tracks.find((x) => x.id !== t.id)?.id || ''
                                      : prev.currentTrackId,
                                }));
                              }}
                              className="p-1 text-white/40 hover:text-rose-400 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Audio Settings (Click to enter toggle & Visualizer) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10">
                  <input
                    type="checkbox"
                    checked={config.requireClickToEnter}
                    onChange={(e) => onUpdateConfig({ requireClickToEnter: e.target.checked })}
                    className="rounded accent-white"
                  />
                  <div>
                    <p className="text-xs font-semibold text-white">Click-To-Enter Gateway</p>
                    <p className="text-[10px] text-white/50">Unlocks instant seamless browser audio autoplay</p>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10">
                  <input
                    type="checkbox"
                    checked={config.showVisualizer}
                    onChange={(e) => onUpdateConfig({ showVisualizer: e.target.checked })}
                    className="rounded accent-white"
                  />
                  <div>
                    <p className="text-xs font-semibold text-white">Equalizer Visualizer</p>
                    <p className="text-[10px] text-white/50">Live animated audio frequency bars</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE & BIO */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Avatar Upload */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                  Profile Picture / Avatar
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 flex-shrink-0 bg-white/5 flex items-center justify-center">
                    {config.avatarUrl ? (
                      <img src={config.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-white/50">MD</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      ref={avatarUploadInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => avatarUploadInputRef.current?.click()}
                      className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Avatar Image
                    </button>

                    <input
                      type="url"
                      placeholder="Or paste avatar image URL"
                      value={avatarUrlInput}
                      onChange={(e) => setAvatarUrlInput(e.target.value)}
                      onBlur={() => {
                        if (avatarUrlInput.trim()) {
                          onUpdateConfig({ avatarUrl: avatarUrlInput.trim() });
                          setAvatarUrlInput('');
                        }
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                    />
                  </div>
                </div>
              </div>

              {/* Bio Credits Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                  Producer Bio & Placement Credits
                </label>
                <textarea
                  rows={3}
                  value={config.bioText}
                  onChange={(e) => onUpdateConfig({ bioText: e.target.value })}
                  placeholder="💿 : Merck, Lil Rae, Gravon, Johnny Slime, Duoto, Roddy Treyy, Babyy Bumpstock, Corey Cartel, Lil Moneyy, NSG Feezy, PGF Omerta, TreTooWavy,+ More"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white leading-relaxed focus:outline-none focus:border-white/50"
                />
              </div>

              {/* Card Blur & Opacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span>Card Glass Opacity</span>
                    <span className="font-mono text-white/50">{config.cardOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={config.cardOpacity}
                    onChange={(e) => onUpdateConfig({ cardOpacity: parseInt(e.target.value) })}
                    className="w-full accent-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span>Card Glass Blur</span>
                    <span className="font-mono text-white/50">{config.cardBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="30"
                    value={config.cardBlur}
                    onChange={(e) => onUpdateConfig({ cardBlur: parseInt(e.target.value) })}
                    className="w-full accent-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SOCIALS & LINKS */}
          {activeTab === 'socials' && (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                Manage Social Icons & Links
              </label>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {config.socialLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={link.enabled}
                      onChange={(e) => {
                        const updated = config.socialLinks.map((l) =>
                          l.id === link.id ? { ...l, enabled: e.target.checked } : l
                        );
                        onUpdateConfig({ socialLinks: updated });
                      }}
                      className="rounded accent-white"
                    />

                    <span className="text-xs font-semibold w-24 capitalize">{link.platform}</span>

                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) => {
                        const updated = config.socialLinks.map((l) =>
                          l.id === link.id ? { ...l, url: e.target.value } : l
                        );
                        onUpdateConfig({ socialLinks: updated });
                      }}
                      placeholder={`Enter ${link.platform} link`}
                      className="flex-1 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-white/40"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY & REALTIME VIEWS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Owner Passcode / PIN */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <p className="text-xs font-bold uppercase tracking-wider text-white">
                    Owner Edit Lock & Passcode
                  </p>
                </div>
                <p className="text-xs text-white/60">
                  Only people with this PIN can unlock edit mode and customize this profile. Visitors see a clean, locked view.
                </p>
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Current Owner PIN
                  </label>
                  <input
                    type="text"
                    value={config.adminPin || '1234'}
                    onChange={(e) => onUpdateConfig({ adminPin: e.target.value })}
                    placeholder="e.g. 1234 or your private pass"
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Realtime Views Counter Manager */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <p className="text-xs font-bold uppercase tracking-wider text-white">
                    Realtime View Counter
                  </p>
                </div>
                <p className="text-xs text-white/60">
                  Total views automatically increment and save persistently across visits. You can also adjust the starting view count here.
                </p>
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold uppercase tracking-wider text-white/70">
                      Total Views Count
                    </label>
                    <span className="font-mono text-cyan-300 font-bold">{config.viewsCount.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={config.viewsCount}
                    onChange={(e) => onUpdateConfig({ viewsCount: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all shadow-lg active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
