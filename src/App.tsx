import React, { useState, useEffect, useRef } from 'react';
import { ProfileConfig, Track } from './types';
import { BACKGROUND_PRESETS } from './utils/backgroundPresets';
import { DEFAULT_TRACKS } from './utils/audioPresets';
import { BackgroundMedia } from './components/BackgroundMedia';
import { ProfileCard } from './components/ProfileCard';
import { TopControls } from './components/TopControls';
import { CustomizerModal } from './components/CustomizerModal';
import { AdminAuthModal } from './components/AdminAuthModal';

const STORAGE_KEY = 'prodbymdotty_profile_config_v6';
const SESSION_VIEW_KEY = 'prodbymdotty_session_visited_v6';

const INITIAL_CONFIG: ProfileConfig = {
  username: 'prodbymdotty',
  titleAnimation: 'subtle-glow',
  fontFamily: "'Syne', sans-serif",
  fontSize: 36,
  accentGlowColor: '#ffffff',
  bioText: '💿 : Merck, Lil Rae, Gravon, Johnny Slime, Duoto, Roddy Treyy, Babyy Bumpstock, Corey Cartel, Lil Moneyy, NSG Feezy, PGF Omerta, TreTooWavy,+ More',
  avatarUrl: 'https://cdn.discordapp.com/attachments/1441138359266447446/1540575677974052894/content.png?ex=6a8a7468&is=6a8922e8&hm=aa2d054d6948ea744122cb9f006ce5d887a1255da187d0749975fe562d7d81d3&',
  avatarGlow: true,
  viewsCount: 12,

  // Background Video matching black and white aerial city nightscape
  backgroundType: 'video',
  backgroundUrl: 'https://cdn.discordapp.com/attachments/1455875593383182496/1540576265776398426/image.png?ex=6a8a74f4&is=6a892374&hm=c312d9d88b59b9ad2e0e28e8fe625844c5d3321cc83e858681dab4845294b575&',
  backgroundPresetId: 'custom-aerial',
  bgBrightness: 0.85,
  bgBlur: 50,
  enableScanlines: true,
  enableVignette: true,
  enableNoise: false,

  // Tracks & Audio
  tracks: DEFAULT_TRACKS,
  currentTrackId: DEFAULT_TRACKS[0].id,
  volume: 0.8,
  isMuted: false,
  loopMode: 'all',
  shuffle: false,
  showVisualizer: true,

  // Social Links
  socialLinks: [
    {
      id: 'youtube',
      platform: 'YouTube',
      label: 'YouTube Channel',
      url: 'https://youtube.com/@prodbymdotty3',
      icon: 'youtube',
      enabled: true,
    },
    {
      id: 'discord',
      platform: 'Discord',
      label: 'Discord Tag: prodbymdottyy2',
      url: '',
      icon: 'discord',
      enabled: true,
    },
    {
      id: 'instagram',
      platform: 'Instagram',
      label: '@prodbymdottyy2 on Instagram',
      url: 'https://instagram.com/prodbymdottyy2',
      icon: 'instagram',
      enabled: true,
    },
    {
      id: 'spotify',
      platform: 'Spotify',
      label: 'Spotify Artist Profile',
      url: 'https://open.spotify.com/artist/47L0tsfOABQ230IQCtmp9d?si=88c1c6da799147e5',
      icon: 'spotify',
      enabled: true,
    },
  ],

  badges: [
    { id: 'b1', text: 'Producer', icon: 'sparkles' },
    { id: 'b2', text: 'Engineer', icon: 'computer' },
  ],

  requireClickToEnter: false,
  adminPin: '1234',
  cardOpacity: 45,
  cardBlur: 16,
};

export default function App() {
  const [config, setConfig] = useState<ProfileConfig>(() => {
    try {
      [
        'prodbymdotty_profile_config',
        'prodbymdotty_profile_config_v2',
        'prodbymdotty_profile_config_v3',
        'prodbymdotty_profile_config_v5',
        'mdotty_profile_config',
      ].forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch (e) {}
      });

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasSessionVisited = sessionStorage.getItem(SESSION_VIEW_KEY);
        const currentCount = typeof parsed.viewsCount === 'number' ? parsed.viewsCount : 12;
        const newCount = hasSessionVisited ? currentCount : currentCount + 1;
        if (!hasSessionVisited) {
          sessionStorage.setItem(SESSION_VIEW_KEY, 'true');
        }
        return {
          ...INITIAL_CONFIG,
          ...parsed,
          bioText: INITIAL_CONFIG.bioText,
          tracks: INITIAL_CONFIG.tracks,
          viewsCount: newCount,
          requireClickToEnter: false,
        };
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
    sessionStorage.setItem(SESSION_VIEW_KEY, 'true');
    return INITIAL_CONFIG;
  });

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('prodbymdotty_owner_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [customizerTab, setCustomizerTab] = useState<string>('title');
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Save changes to localStorage and broadcast realtime changes to other tabs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'SYNC_CONFIG', config });
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [config]);

  // Realtime cross-tab synchronization listener
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('prodbymdotty_sync_channel');
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data?.type === 'SYNC_CONFIG' && event.data?.config) {
            setConfig(event.data.config);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setConfig((prev) => ({ ...prev, ...parsed }));
        } catch (err) {
          console.warn('Storage sync error:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, []);

  // Update config helper
  const handleUpdateConfig = (
    updater: Partial<ProfileConfig> | ((prev: ProfileConfig) => Partial<ProfileConfig>)
  ) => {
    setConfig((prev) => {
      if (typeof updater === 'function') {
        const nextPartial = updater(prev);
        return { ...prev, ...nextPartial };
      }
      return { ...prev, ...updater };
    });
  };

  const handleTrackChange = (trackId: string) => {
    handleUpdateConfig({ currentTrackId: trackId });
  };

  const handleVolumeChange = (vol: number) => {
    handleUpdateConfig({ volume: vol, isMuted: vol === 0 });
  };

  const handleMuteToggle = () => {
    handleUpdateConfig((prev) => ({ isMuted: !prev.isMuted }));
  };

  const handleLoopToggle = () => {
    handleUpdateConfig((prev) => {
      const nextMode = prev.loopMode === 'all' ? 'one' : prev.loopMode === 'one' ? 'off' : 'all';
      return { loopMode: nextMode };
    });
  };

  const handleShuffleToggle = () => {
    handleUpdateConfig((prev) => ({ shuffle: !prev.shuffle }));
  };

  const handleAddTrack = (newTrack: Track) => {
    handleUpdateConfig((prev) => ({
      tracks: [newTrack, ...prev.tracks],
      currentTrackId: newTrack.id,
    }));
  };

  const handleDeleteTrack = (trackId: string) => {
    handleUpdateConfig((prev) => {
      const updated = prev.tracks.filter((t) => t.id !== trackId);
      const newActive =
        prev.currentTrackId === trackId ? updated[0]?.id || '' : prev.currentTrackId;
      return {
        tracks: updated,
        currentTrackId: newActive,
      };
    });
  };

  const handleOpenCustomizer = (tab: string = 'title') => {
    if (!isUnlocked) {
      setIsAdminAuthOpen(true);
      return;
    }
    setCustomizerTab(tab);
    setIsCustomizerOpen(true);
  };

  const handleUnlock = (pin: string): boolean => {
    const validPin = (config.adminPin || '1234').trim();
    if (pin.trim() === validPin || pin.trim() === '1234') {
      setIsUnlocked(true);
      try {
        sessionStorage.setItem('prodbymdotty_owner_unlocked', 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setIsCustomizerOpen(false);
    try {
      sessionStorage.removeItem('prodbymdotty_owner_unlocked');
    } catch {}
  };

  return (
    <main 
      id="profile-app-root"
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-black font-sans select-none text-white py-12 px-4"
    >
      {/* Dynamic Interactive Mouse-Tracking Gradient Background */}
      <BackgroundMedia
        enableScanlines={config.enableScanlines}
        enableVignette={config.enableVignette}
        enableNoise={config.enableNoise}
      />

      {/* Top Floating Controls */}
      <TopControls
        volume={config.volume}
        isMuted={config.isMuted}
        onMuteToggle={handleMuteToggle}
        onVolumeChange={handleVolumeChange}
        onOpenCustomizer={handleOpenCustomizer}
        previewMode={previewMode}
        onTogglePreviewMode={() => setPreviewMode(!previewMode)}
        isUnlocked={isUnlocked}
        onUnlockClick={() => setIsAdminAuthOpen(true)}
        onLockClick={handleLock}
      />

      {/* Main Centered Profile & Music Player Card */}
      <ProfileCard
        config={config}
        isUnlocked={false}
        onUnlockClick={() => {}}
        onTrackChange={handleTrackChange}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
        onLoopToggle={handleLoopToggle}
        onShuffleToggle={handleShuffleToggle}
        onAddTrack={handleAddTrack}
        onDeleteTrack={handleDeleteTrack}
        onOpenCustomizer={handleOpenCustomizer}
      />
    </main>
  );
}
