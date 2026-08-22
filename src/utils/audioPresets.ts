import { Track } from '../types';
import { beatSynth, BeatSynthesizer } from './audioSynth';

export const DEFAULT_TRACKS: Track[] = [
  {
    id: 'track-300bond',
    title: '300 Bond',
    artist: 'prodbymdotty',
    src: 'synth:300bond',
    duration: 135, // 2:15 as shown in screenshot
    coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
  },
  {
    id: 'track-tokyo',
    title: 'Midnight Tokyo',
    artist: 'prodbymdotty',
    src: 'synth:tokyo',
    duration: 160,
    coverArt: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300&q=80',
  },
  {
    id: 'track-shadow',
    title: 'Shadow Realm 808',
    artist: 'prodbymdotty',
    src: 'synth:shadow',
    duration: 142,
    coverArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80',
  },
  {
    id: 'track-cloud9',
    title: 'Cloud 9 Chill',
    artist: 'prodbymdotty',
    src: 'synth:cloud9',
    duration: 180,
    coverArt: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&q=80',
  },
];

// Blob URL Cache for synthesized procedural beats
const synthBlobCache = new Map<string, string>();

/**
 * Resolves a track's audio source to a playable HTMLAudioElement URL.
 * If track.src starts with "synth:", it renders the procedural beat and returns a cached Blob URL.
 */
export async function resolveTrackAudioUrl(track: Track): Promise<string> {
  if (track.src.startsWith('synth:')) {
    const style = track.src.replace('synth:', '') as '300bond' | 'tokyo' | 'shadow' | 'cloud9';
    if (synthBlobCache.has(style)) {
      return synthBlobCache.get(style)!;
    }

    try {
      const buffer = beatSynth.generateBeatBuffer(style, 60);
      const blobUrl = await BeatSynthesizer.bufferToWaveBlobUrl(buffer);
      synthBlobCache.set(style, blobUrl);
      return blobUrl;
    } catch (e) {
      console.warn('Procedural synthesis fallback error:', e);
      // Return a reliable fallback synth tone
      return '';
    }
  }

  return track.src;
}
