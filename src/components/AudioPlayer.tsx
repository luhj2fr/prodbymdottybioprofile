import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  ListMusic, 
  Plus, 
  Repeat, 
  Shuffle, 
  Music,
  Trash2,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { Track } from '../types';
import { resolveTrackAudioUrl } from '../utils/audioPresets';
import { AudioVisualizer } from './AudioVisualizer';

interface AudioPlayerProps {
  tracks: Track[];
  currentTrackId: string;
  volume: number;
  isMuted: boolean;
  loopMode: 'all' | 'one' | 'off';
  shuffle: boolean;
  showVisualizer: boolean;
  onTrackChange: (trackId: string) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onLoopToggle: () => void;
  onShuffleToggle: () => void;
  onAddTrack: (newTrack: Track) => void;
  onDeleteTrack: (trackId: string) => void;
  onOpenCustomizer?: (tab?: string) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  tracks,
  currentTrackId,
  volume,
  isMuted,
  loopMode,
  shuffle,
  showVisualizer,
  onTrackChange,
  onVolumeChange,
  onMuteToggle,
  onLoopToggle,
  onShuffleToggle,
  onAddTrack,
  onDeleteTrack,
  onOpenCustomizer,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(135);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState<boolean>(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [customAudioUrl, setCustomAudioUrl] = useState<string>('');
  const [customTrackTitle, setCustomTrackTitle] = useState<string>('');
  const [customTrackArtist, setCustomTrackArtist] = useState<string>('prodbymdotty');
  const [audioSrc, setAudioSrc] = useState<string>('');
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentTrack = tracks.find((t) => t.id === currentTrackId) || tracks[0];

  // Resolve audio source whenever current track changes
  useEffect(() => {
    let isCancelled = false;
    if (!currentTrack) return;

    setIsLoadingAudio(true);
    resolveTrackAudioUrl(currentTrack).then((url) => {
      if (!isCancelled) {
        setAudioSrc(url);
        setIsLoadingAudio(false);
        // If it was playing, resume once src updates
        if (audioRef.current && isPlaying) {
          audioRef.current.load();
          audioRef.current.play().catch((err) => console.log('Autoplay policy caught:', err));
        }
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [currentTrack?.id]);

  // Sync volume and mute with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Play / Pause toggle
  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.warn('Playback error / User interaction needed:', e);
        setIsPlaying(false);
      }
    }
  };

  // Next Track
  const handleNext = () => {
    if (tracks.length <= 1) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    if (shuffle) {
      const remaining = tracks.filter((t) => t.id !== currentTrackId);
      const randomTrack = remaining[Math.floor(Math.random() * remaining.length)];
      onTrackChange(randomTrack.id);
    } else {
      const currentIndex = tracks.findIndex((t) => t.id === currentTrackId);
      const nextIndex = (currentIndex + 1) % tracks.length;
      onTrackChange(tracks[nextIndex].id);
    }
  };

  // Previous Track
  const handlePrev = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = tracks.findIndex((t) => t.id === currentTrackId);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    onTrackChange(tracks[prevIndex].id);
  };

  // Handle Track End
  const handleEnded = () => {
    if (loopMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (loopMode === 'all') {
      handleNext();
    } else {
      const currentIndex = tracks.findIndex((t) => t.id === currentTrackId);
      if (currentIndex < tracks.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    }
  };

  // Progress Bar Seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * (duration || 1);
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileBlobUrl = URL.createObjectURL(file);
    const newTrack: Track = {
      id: `uploaded-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'prodbymdotty (Uploaded)',
      src: fileBlobUrl,
      duration: 180,
      isUploaded: true,
    };

    onAddTrack(newTrack);
    onTrackChange(newTrack.id);
    setIsQuickAddOpen(false);
  };

  // Handle URL Add
  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAudioUrl.trim()) return;

    const newTrack: Track = {
      id: `custom-${Date.now()}`,
      title: customTrackTitle.trim() || 'Custom Track',
      artist: customTrackArtist.trim() || 'prodbymdotty',
      src: customAudioUrl.trim(),
      duration: 180,
      isCustomUrl: true,
    };

    onAddTrack(newTrack);
    onTrackChange(newTrack.id);
    setCustomAudioUrl('');
    setCustomTrackTitle('');
    setIsQuickAddOpen(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto relative group">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioSrc || undefined}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || currentTrack?.duration || 135);
          }
        }}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Main Glass Audio Bar (Matches Vibrant Palette Design) */}
      <div 
        id="integrated-audio-player"
        className="w-full bg-[#0a0a0e]/70 backdrop-blur-2xl border border-white/10 hover:border-cyan-400/30 transition-all duration-300 rounded-2xl p-3.5 sm:p-4 shadow-2xl shadow-black/80 flex flex-col gap-2.5"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Track Cover / Icon with Vibrant Accent */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner group/cover">
              {currentTrack?.coverArt ? (
                <img
                  src={currentTrack.coverArt}
                  alt={currentTrack.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/cover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900/60 to-blue-900/60 flex items-center justify-center">
                  <Music className="w-5 h-5 text-cyan-300" />
                </div>
              )}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="flex items-end gap-[2px] h-3.5">
                    <span className="w-[3px] bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]" style={{ height: '60%' }} />
                    <span className="w-[3px] bg-fuchsia-400 rounded-full animate-bounce [animation-delay:150ms]" style={{ height: '100%' }} />
                    <span className="w-[3px] bg-cyan-300 rounded-full animate-bounce [animation-delay:300ms]" style={{ height: '40%' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Title & Artist & Visualizer */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white truncate tracking-wide">
                  {currentTrack?.title || 'No Track Selected'}
                </p>
                {showVisualizer && (
                  <AudioVisualizer isPlaying={isPlaying} barCount={8} color="gradient" className="hidden sm:block opacity-85" />
                )}
              </div>
              <p className="text-[11px] text-cyan-400 font-medium uppercase tracking-wider truncate">
                {currentTrack?.artist || 'prodbymdotty'}
              </p>
            </div>
          </div>

          {/* Controls: Prev, Play/Pause, Next */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              id="player-btn-prev"
              onClick={handlePrev}
              className="p-2 text-white/70 hover:text-cyan-300 hover:bg-white/10 rounded-full transition-all duration-200 active:scale-90"
              title="Previous Track"
              aria-label="Previous Track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              id="player-btn-play"
              onClick={togglePlay}
              disabled={isLoadingAudio}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-fuchsia-500 to-cyan-400 text-black hover:scale-105 flex items-center justify-center transition-all duration-200 shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-95 disabled:opacity-50"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoadingAudio ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black ml-0.5" />
              )}
            </button>

            <button
              id="player-btn-next"
              onClick={handleNext}
              className="p-2 text-white/70 hover:text-cyan-300 hover:bg-white/10 rounded-full transition-all duration-200 active:scale-90"
              title="Next Track"
              aria-label="Next Track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            {/* Playlist Toggle */}
            <button
              id="player-btn-playlist"
              onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
              className={`p-2 rounded-full transition-all duration-200 ${
                isPlaylistOpen ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title="Tracklist & Custom Audio"
              aria-label="Tracklist"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Scrubber & Timestamp with Vibrant Gradient */}
        <div className="flex items-center gap-3 pt-0.5">
          <span className="text-[11px] font-mono text-cyan-300/80 w-8 text-left select-none">
            {formatTime(currentTime)}
          </span>

          <div
            ref={progressBarRef}
            onClick={handleSeek}
            className="flex-1 h-1.5 bg-white/15 hover:h-2 rounded-full cursor-pointer relative transition-all duration-150 group/scrubber"
          >
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full relative"
              style={{ width: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_#fff,0_0_15px_rgba(34,211,238,0.8)] opacity-90 group-hover/scrubber:scale-125 transition-transform" />
            </div>
          </div>

          <span className="text-[11px] font-mono text-white/50 w-8 text-right select-none">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Collapsible Playlist & Track Management Drawer */}
      {isPlaylistOpen && (
        <div 
          id="playlist-management-drawer"
          className="mt-2 w-full bg-[#0d0d14]/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-30"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Track Management</h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-cyan-300">
                {tracks.length} songs
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Loop mode toggle */}
              <button
                onClick={onLoopToggle}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  loopMode !== 'off' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-white/50 hover:text-white'
                }`}
                title={`Loop: ${loopMode}`}
              >
                <Repeat className="w-3.5 h-3.5" />
                {loopMode === 'one' && <span className="text-[9px] font-bold">1</span>}
              </button>

              {/* Shuffle toggle */}
              <button
                onClick={onShuffleToggle}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                  shuffle ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' : 'text-white/50 hover:text-white'
                }`}
                title="Shuffle playlist"
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              {/* Add Track Button */}
              <button
                onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black text-xs font-bold flex items-center gap-1 transition-all hover:opacity-95 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Song
              </button>
            </div>
          </div>

          {/* Quick Add Custom Track Panel */}
          {isQuickAddOpen && (
            <div className="p-3 mb-3 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white/90">Add Any Song for Background</p>
                <span className="text-[10px] text-cyan-300/70">MP3 / WAV / Direct URL</span>
              </div>

              {/* Upload Local File */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-cyan-400/30 hover:border-cyan-400/70 bg-white/5 hover:bg-cyan-500/10 text-xs text-white/90 flex items-center justify-center gap-2 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  Upload Audio File from Device (MP3/WAV)
                </button>
              </div>

              {/* Or Direct URL */}
              <form onSubmit={handleAddCustomUrl} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Track Title (e.g. My Dark Beat)"
                    value={customTrackTitle}
                    onChange={(e) => setCustomTrackTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50"
                  />
                  <input
                    type="text"
                    placeholder="Artist (prodbymdotty)"
                    value={customTrackArtist}
                    onChange={(e) => setCustomTrackArtist(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="url"
                      placeholder="Paste direct audio URL (https://.../song.mp3)"
                      value={customAudioUrl}
                      onChange={(e) => setCustomAudioUrl(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-bold rounded-lg text-xs hover:opacity-95 transition-opacity"
                  >
                    Add URL
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tracks List */}
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {tracks.map((t, idx) => {
              const isSelected = t.id === currentTrackId;
              return (
                <div
                  key={t.id}
                  onClick={() => onTrackChange(t.id)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/70 to-fuchsia-950/60 text-white font-medium border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                      : 'text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-4 text-center font-mono text-[10px] ${isSelected ? 'text-cyan-400 font-bold' : 'text-white/40'}`}>
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className={`truncate font-medium ${isSelected ? 'text-white' : 'text-white/90'}`}>{t.title}</p>
                      <p className="text-[10px] text-cyan-400/70 truncate">{t.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isSelected && isPlaying && (
                      <span className="text-[10px] text-cyan-300 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        Playing
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-white/40">
                      {formatTime(t.duration)}
                    </span>
                    {tracks.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTrack(t.id);
                        }}
                        className="p-1 text-white/30 hover:text-rose-400 rounded-md transition-colors"
                        title="Remove track"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
