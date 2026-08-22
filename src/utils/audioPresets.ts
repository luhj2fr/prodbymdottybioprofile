import { Track } from '../types';
import { beatSynth, BeatSynthesizer } from './audioSynth';

export const DEFAULT_TRACKS: Track[] = [
  {
    id: 'track-ebk-allegations',
    title: 'Johnny Slime - EBK/Allegations',
    artist: 'prodbymdotty',
    src: 'https://cdn.discordapp.com/attachments/1455875593383182496/1540578126755659849/Johnny_Slime_-_EBKAllegations_Official_Music_Video_shot_by_shotbyvictorr.mp3?ex=6a8a76af&is=6a89252f&hm=d9190bc6e1b5039fb9a82ad78755efb7de2e3bc8b9338b7adf6fac1bf7be7fdf&',
    duration: 168,
    coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
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
