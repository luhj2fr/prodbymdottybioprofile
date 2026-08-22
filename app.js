// ==========================================
// prodbymdotty - Vanilla HTML/CSS/JS Engine
// Compatible with GitHub Pages (github.io) with 0 build steps
// ==========================================

const STORAGE_KEY = 'prodbymdotty_profile_config_v6';
const SESSION_VIEW_KEY = 'prodbymdotty_session_visited_v6';

// Procedural Beat Synth Tracks (Plays real beats directly via Web Audio API + custom URL support)
const DEFAULT_TRACKS = [
  {
    id: 't1',
    title: 'EBK/Allegations',
    artist: 'Johnny Slime',
    duration: 165,
    startOffset: 3,
    bpm: 140,
    url: 'https://cdn.discordapp.com/attachments/1455875593383182496/1540578126755659849/Johnny_Slime_-_EBKAllegations_Official_Music_Video_shot_by_shotbyvictorr.mp3?ex=6a8a76af&is=6a89252f&hm=d9190bc6e1b5039fb9a82ad78755efb7de2e3bc8b9338b7adf6fac1bf7be7fdf&',
  },
];

const DEFAULT_CONFIG = {
  username: 'prodbymdotty',
  titleAnimation: 'subtle-glow',
  bioText: '💿 : Merck, Lil Rae, Gravon, Johnny Slime, Duoto, Roddy Treyy, Babyy Bumpstock, Corey Cartel, Lil Moneyy, NSG Feezy, PGF Omerta, TreTooWavy,+ More',
  avatarUrl: 'https://cdn.discordapp.com/attachments/1441138359266447446/1540575677974052894/content.png?ex=6a8a7468&is=6a8922e8&hm=aa2d054d6948ea744122cb9f006ce5d887a1255da187d0749975fe562d7d81d3&',
  backgroundUrl: 'https://cdn.discordapp.com/attachments/1455875593383182496/1540576265776398426/image.png?ex=6a8a74f4&is=6a892374&hm=c312d9d88b59b9ad2e0e28e8fe625844c5d3321cc83e858681dab4845294b575&',
  bgBrightness: 0.85,
  bgBlur: 50,
  viewsCount: 12,
  adminPin: '011511',
  tracks: DEFAULT_TRACKS,
};

// Helper to get start offset (in seconds) for audio trimming
function getTrackOffset(track) {
  return track && track.startOffset !== undefined ? track.startOffset : 3;
}

// Application State
let appState = {
  ...DEFAULT_CONFIG,
  currentTrackIndex: 0,
  isPlaying: false,
  currentTime: 0,
  volume: 0.8,
  isMuted: false,
  loopMode: 'all', // 'all', 'one', 'off'
  isShuffle: false,
  isUnlocked: false,
};

// Web Audio API Synth Engine
let audioCtx = null;
let synthInterval = null;
let visualizerAnimationId = null;

// Initialize State from LocalStorage
function initStorage() {
  try {
    // Clear all legacy storage keys so older cached versions don't overwrite new data
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
      appState = { ...appState, ...parsed };
    }

    // Always strictly enforce the single Johnny Slime track and correct bioText
    appState.tracks = DEFAULT_TRACKS;
    appState.bioText = DEFAULT_CONFIG.bioText;
    appState.avatarUrl = DEFAULT_CONFIG.avatarUrl;

    // Increment view count EVERY time the page is loaded/viewed
    appState.viewsCount = (Number(appState.viewsCount) || 12) + 1;
    saveState();

    // Check if owner was unlocked in this session
    appState.isUnlocked = sessionStorage.getItem('prodbymdotty_owner_unlocked') === 'true';
  } catch (e) {
    console.warn('Storage initialization error:', e);
  }
}

function saveState() {
  try {
    const toSave = {
      username: appState.username,
      titleAnimation: appState.titleAnimation,
      bioText: appState.bioText,
      avatarUrl: appState.avatarUrl,
      backgroundUrl: appState.backgroundUrl,
      bgBrightness: appState.bgBrightness,
      bgBlur: appState.bgBlur,
      viewsCount: appState.viewsCount,
      adminPin: appState.adminPin,
      tracks: appState.tracks,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));

    // Broadcast across tabs
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('prodbymdotty_sync_channel');
      bc.postMessage({ type: 'SYNC', state: toSave });
      bc.close();
    }
  } catch (e) {
    console.warn('Save state error:', e);
  }
}

// Cross-tab Synchronization
function initSync() {
  if ('BroadcastChannel' in window) {
    const bc = new BroadcastChannel('prodbymdotty_sync_channel');
    bc.onmessage = (event) => {
      if (event.data?.type === 'SYNC' && event.data?.state) {
        Object.assign(appState, event.data.state);
        renderAll();
      }
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        Object.assign(appState, parsed);
        renderAll();
      } catch (err) {}
    }
  });
}

// Audio Player & Procedural Synthesizer
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playProceduralBeatNote(time, step, bpm) {
  if (!appState.isPlaying || appState.isMuted) return;
  const ctx = getAudioContext();
  const currentVol = appState.isMuted ? 0 : appState.volume;

  // 808 Sub-bass kick (beats 0, 4, 8, 11)
  if (step % 4 === 0 || step === 10) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.28);
    gain.gain.setValueAtTime(0.6 * currentVol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.38);
  }

  // Snare / Clap on beats 4 and 12
  if (step === 4 || step === 12) {
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35 * currentVol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(time);
    noise.stop(time + 0.16);
  }

  // Trap Hi-hats on every 16th step with pitch variations
  if (step % 2 === 0 || step === 7 || step === 15) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(7500 + Math.sin(step) * 1200, time);
    gain.gain.setValueAtTime(0.18 * currentVol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.05);
  }

  // Dark Synth Melodic Arp (Moody Minor chords)
  if (step % 2 === 0) {
    const notes = [220, 261.63, 329.63, 392.0, 440, 523.25];
    const freq = notes[(step * 3) % notes.length];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);
    gain.gain.setValueAtTime(0.12 * currentVol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.22);
  }
}

function startBeatEngine() {
  stopBeatEngine();
  const track = appState.tracks[appState.currentTrackIndex] || DEFAULT_TRACKS[0];

  // If track has custom external MP3 url, play via HTML5 Audio element
  const audioEl = document.getElementById('main-audio');
  if (track.url && track.url.trim() !== '') {
    const offset = getTrackOffset(track);
    const targetSrc = track.url;
    if (!audioEl.src || !audioEl.src.includes(targetSrc.substring(0, 40))) {
      audioEl.src = targetSrc;
      audioEl.currentTime = offset + (appState.currentTime || 0);
    } else {
      if (audioEl.currentTime < offset) {
        audioEl.currentTime = offset + (appState.currentTime || 0);
      }
    }
    audioEl.volume = appState.isMuted ? 0 : appState.volume;
    audioEl.play().catch(() => {});
    return;
  }

  // Otherwise synthesize procedural producer beat
  const bpm = track.bpm || 140;
  const stepTimeMs = (60 / bpm / 4) * 1000;
  let currentStep = 0;

  synthInterval = setInterval(() => {
    if (!appState.isPlaying) return;
    const ctx = getAudioContext();
    playProceduralBeatNote(ctx.currentTime, currentStep % 16, bpm);
    currentStep++;

    appState.currentTime += stepTimeMs / 1000;
    const duration = track.duration || 165;

    if (appState.currentTime >= duration) {
      if (appState.loopMode === 'one') {
        appState.currentTime = 0;
      } else if (appState.loopMode === 'all') {
        handleNextTrack();
      } else {
        pauseTrack();
        appState.currentTime = 0;
      }
    }
    updateProgressUI();
  }, stepTimeMs);
}

function stopBeatEngine() {
  if (synthInterval) {
    clearInterval(synthInterval);
    synthInterval = null;
  }
  const audioEl = document.getElementById('main-audio');
  if (audioEl) {
    audioEl.pause();
  }
}

function playTrack() {
  getAudioContext();
  appState.isPlaying = true;
  startBeatEngine();
  renderPlayerControls();
  startVisualizer();
}

function pauseTrack() {
  appState.isPlaying = false;
  stopBeatEngine();
  renderPlayerControls();
}

function togglePlayPause() {
  if (appState.isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
}

function handleNextTrack() {
  if (appState.isShuffle) {
    appState.currentTrackIndex = Math.floor(Math.random() * appState.tracks.length);
  } else {
    appState.currentTrackIndex = (appState.currentTrackIndex + 1) % appState.tracks.length;
  }
  appState.currentTime = 0;
  const audioEl = document.getElementById('main-audio');
  const track = appState.tracks[appState.currentTrackIndex] || DEFAULT_TRACKS[0];
  const offset = getTrackOffset(track);
  if (audioEl) {
    audioEl.currentTime = offset;
  }
  renderTrackInfo();
  renderPlaylistDrawer();
  if (appState.isPlaying) {
    startBeatEngine();
  }
}

function handlePrevTrack() {
  const audioEl = document.getElementById('main-audio');
  const track = appState.tracks[appState.currentTrackIndex] || DEFAULT_TRACKS[0];
  const offset = getTrackOffset(track);
  if (appState.currentTime > 3) {
    appState.currentTime = 0;
    if (audioEl) audioEl.currentTime = offset;
  } else {
    appState.currentTrackIndex = (appState.currentTrackIndex - 1 + appState.tracks.length) % appState.tracks.length;
    appState.currentTime = 0;
    const newTrack = appState.tracks[appState.currentTrackIndex] || DEFAULT_TRACKS[0];
    if (audioEl) audioEl.currentTime = getTrackOffset(newTrack);
  }
  renderTrackInfo();
  renderPlaylistDrawer();
  if (appState.isPlaying) {
    startBeatEngine();
  }
}

// Canvas Waveform Visualizer
function startVisualizer() {
  const canvas = document.getElementById('visualizer-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const numBars = 18;

  function renderFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isAudioPlaying = appState.isPlaying && !appState.isMuted;

    for (let i = 0; i < numBars; i++) {
      const x = i * (canvas.width / numBars) + 2;
      const barWidth = canvas.width / numBars - 3;
      let barHeight = 4;

      if (isAudioPlaying) {
        const time = Date.now() * 0.008;
        const wave = Math.sin(time + i * 0.45) * 0.5 + 0.5;
        const sub = Math.sin(time * 0.5 + i * 0.2) * 0.5 + 0.5;
        barHeight = Math.max(4, (wave * 0.7 + sub * 0.3) * (canvas.height - 6));
      }

      const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
      grad.addColorStop(0, '#06b6d4');
      grad.addColorStop(1, '#d946ef');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, canvas.height - barHeight - 2, barWidth, barHeight, 2);
      ctx.fill();
    }

    visualizerAnimationId = requestAnimationFrame(renderFrame);
  }

  if (visualizerAnimationId) {
    cancelAnimationFrame(visualizerAnimationId);
  }
  renderFrame();
}

// Format Seconds to MM:SS
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// UI Render Helpers
function updateProgressUI() {
  const track = appState.tracks[appState.currentTrackIndex] || DEFAULT_TRACKS[0];
  const duration = track.duration || 134;
  const pct = Math.min(100, (appState.currentTime / duration) * 100);

  const fillEl = document.getElementById('progress-bar-fill');
  if (fillEl) fillEl.style.width = `${pct}%`;

  const currEl = document.getElementById('time-current');
  if (currEl) currEl.textContent = formatTime(appState.currentTime);

  const durEl = document.getElementById('time-duration');
  if (durEl) durEl.textContent = formatTime(duration);
}

function renderTrackInfo() {
  const track = appState.tracks[appState.currentTrackIndex] || DEFAULT_TRACKS[0];
  document.getElementById('current-track-title').textContent = track.title;
  document.getElementById('current-track-artist').textContent = track.artist;
  document.getElementById('time-duration').textContent = formatTime(track.duration || 134);
  updateProgressUI();
}

function renderPlayerControls() {
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const spinner = document.getElementById('disc-spinner');

  if (appState.isPlaying) {
    iconPlay.classList.add('hidden');
    iconPause.classList.remove('hidden');
    if (spinner) spinner.classList.add('animate-pulse');
  } else {
    iconPlay.classList.remove('hidden');
    iconPause.classList.add('hidden');
    if (spinner) spinner.classList.remove('animate-pulse');
  }

  // Loop & Shuffle buttons visual state
  const btnLoop = document.getElementById('btn-loop');
  if (btnLoop) {
    btnLoop.className = `p-2 rounded-xl transition-colors ${
      appState.loopMode === 'all'
        ? 'text-cyan-400'
        : appState.loopMode === 'one'
        ? 'text-fuchsia-400'
        : 'text-white/40'
    }`;
  }

  const btnShuffle = document.getElementById('btn-shuffle');
  if (btnShuffle) {
    btnShuffle.className = `p-2 rounded-xl transition-colors ${
      appState.isShuffle ? 'text-cyan-400' : 'text-white/40'
    }`;
  }
}

function renderPlaylistDrawer() {
  const container = document.getElementById('playlist-items');
  if (!container) return;
  container.innerHTML = '';

  appState.tracks.forEach((t, index) => {
    const isCurrent = index === appState.currentTrackIndex;
    const row = document.createElement('div');
    row.className = `flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
      isCurrent ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'hover:bg-white/5 text-white/80'
    }`;
    row.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="text-xs font-mono opacity-50">${index + 1}</span>
        <span class="text-xs font-bold truncate">${t.title}</span>
      </div>
      <span class="text-[10px] font-mono opacity-60">${formatTime(t.duration || 134)}</span>
    `;
    row.onclick = () => {
      appState.currentTrackIndex = index;
      appState.currentTime = 0;
      renderTrackInfo();
      renderPlaylistDrawer();
      playTrack();
    };
    container.appendChild(row);
  });
}

function renderProfile() {
  const usernameEl = document.getElementById('username-display');
  if (usernameEl) {
    usernameEl.textContent = appState.username;
    // Set animation class
    usernameEl.className = 'font-syne font-extrabold tracking-tight text-3xl sm:text-4xl';
    if (appState.titleAnimation === 'subtle-glow') {
      usernameEl.classList.add('anim-subtle-glow');
    } else if (appState.titleAnimation === 'smooth-gradient') {
      usernameEl.classList.add('anim-smooth-gradient');
    } else if (appState.titleAnimation === 'minimal-clean') {
      usernameEl.classList.add('anim-minimal-clean');
    } else if (appState.titleAnimation === 'glitch-wavy') {
      usernameEl.classList.add('anim-glitch-wavy');
    } else if (appState.titleAnimation === 'wave-float') {
      usernameEl.classList.add('anim-wave-float');
      usernameEl.innerHTML = appState.username
        .split('')
        .map((char, i) => `<span style="animation-delay: ${i * 0.08}s">${char}</span>`)
        .join('');
    }
  }

  const bioEl = document.getElementById('bio-display');
  if (bioEl) bioEl.textContent = appState.bioText;

  const avatarImg = document.getElementById('avatar-img');
  if (avatarImg) avatarImg.src = appState.avatarUrl;

  const viewsEl = document.getElementById('view-counter-text');
  if (viewsEl) viewsEl.textContent = `${Number(appState.viewsCount || 12).toLocaleString()} views`;

  // Background settings
  const bgVid = document.getElementById('bg-video');
  if (bgVid) {
    bgVid.style.filter = `brightness(${appState.bgBrightness}) blur(${appState.bgBlur}px) contrast(1.15) grayscale(0.85)`;
    if (appState.backgroundUrl && bgVid.src !== appState.backgroundUrl) {
      bgVid.src = appState.backgroundUrl;
    }
  }
}

function renderAll() {
  renderProfile();
  renderTrackInfo();
  renderPlayerControls();
  renderPlaylistDrawer();
}

// Toast Notifications
function showToast(message) {
  const toast = document.getElementById('toast-notify');
  const text = document.getElementById('toast-text');
  if (toast && text) {
    text.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 2400);
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // HTML5 Audio element event listeners
  const audioEl = document.getElementById('main-audio');
  if (audioEl) {
    audioEl.addEventListener('timeupdate', () => {
      const track = appState.tracks[appState.currentTrackIndex] || DEFAULT_TRACKS[0];
      const offset = getTrackOffset(track);
      appState.currentTime = Math.max(0, audioEl.currentTime - offset);
      updateProgressUI();
    });
    audioEl.addEventListener('loadedmetadata', () => {
      if (audioEl.duration && !isNaN(audioEl.duration)) {
        const track = appState.tracks[appState.currentTrackIndex] || DEFAULT_TRACKS[0];
        if (track) {
          const offset = getTrackOffset(track);
          track.duration = Math.max(1, Math.round(audioEl.duration - offset));
          renderTrackInfo();
        }
      }
    });
    audioEl.addEventListener('ended', () => {
      const track = appState.tracks[appState.currentTrackIndex] || DEFAULT_TRACKS[0];
      const offset = getTrackOffset(track);
      if (appState.loopMode === 'one') {
        audioEl.currentTime = offset;
        appState.currentTime = 0;
        audioEl.play().catch(() => {});
      } else if (appState.loopMode === 'all') {
        handleNextTrack();
      } else {
        pauseTrack();
        appState.currentTime = 0;
        audioEl.currentTime = offset;
        updateProgressUI();
      }
    });
  }

  // Volume mute and slider
  const btnVol = document.getElementById('btn-volume-toggle');
  const volSlider = document.getElementById('volume-slider');
  const iconVolHigh = document.getElementById('icon-volume-high');
  const iconVolMuted = document.getElementById('icon-volume-muted');

  btnVol.addEventListener('click', () => {
    appState.isMuted = !appState.isMuted;
    if (audioEl) audioEl.muted = appState.isMuted;
    if (appState.isMuted) {
      iconVolHigh.classList.add('hidden');
      iconVolMuted.classList.remove('hidden');
    } else {
      iconVolHigh.classList.remove('hidden');
      iconVolMuted.classList.add('hidden');
    }
  });

  volSlider.addEventListener('input', (e) => {
    appState.volume = parseFloat(e.target.value);
    appState.isMuted = appState.volume === 0;
    if (audioEl) {
      audioEl.volume = appState.volume;
      audioEl.muted = appState.isMuted;
    }
    if (appState.isMuted) {
      iconVolHigh.classList.add('hidden');
      iconVolMuted.classList.remove('hidden');
    } else {
      iconVolHigh.classList.remove('hidden');
      iconVolMuted.classList.add('hidden');
    }
  });

  // Fullscreen
  document.getElementById('btn-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Player controls
  document.getElementById('btn-play-pause').addEventListener('click', togglePlayPause);
  document.getElementById('btn-next-track').addEventListener('click', handleNextTrack);
  document.getElementById('btn-prev-track').addEventListener('click', handlePrevTrack);

  document.getElementById('btn-loop').addEventListener('click', () => {
    appState.loopMode = appState.loopMode === 'all' ? 'one' : appState.loopMode === 'one' ? 'off' : 'all';
    renderPlayerControls();
  });

  document.getElementById('btn-shuffle').addEventListener('click', () => {
    appState.isShuffle = !appState.isShuffle;
    renderPlayerControls();
  });

  document.getElementById('btn-playlist-toggle').addEventListener('click', () => {
    const drawer = document.getElementById('playlist-drawer');
    drawer.classList.toggle('hidden');
    drawer.classList.toggle('flex');
  });

  // Progress Bar Seek
  document.getElementById('progress-bar-container').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const track = appState.tracks[appState.currentTrackIndex] || DEFAULT_TRACKS[0];
    const offset = getTrackOffset(track);
    appState.currentTime = ratio * (track.duration || 165);
    if (track.url && audioEl) {
      audioEl.currentTime = appState.currentTime + offset;
    }
    updateProgressUI();
  });

  // Interactive Mouse-Tracking Gradient Background
  const interactiveBg = document.getElementById('bg-interactive-gradient');
  const orb1 = document.getElementById('glow-orb-1');
  const orb2 = document.getElementById('glow-orb-2');
  const orb3 = document.getElementById('glow-orb-3');

  function updateMouseGradient(clientX, clientY) {
    const xPct = Math.round((clientX / window.innerWidth) * 100);
    const yPct = Math.round((clientY / window.innerHeight) * 100);
    const dx = (clientX / window.innerWidth - 0.5) * 70;
    const dy = (clientY / window.innerHeight - 0.5) * 70;

    if (interactiveBg) {
      interactiveBg.style.background = `radial-gradient(850px circle at ${xPct}% ${yPct}%, rgba(217, 70, 239, 0.28), transparent 60%), radial-gradient(950px circle at ${100 - xPct}% ${100 - yPct}%, rgba(34, 211, 238, 0.24), transparent 65%), radial-gradient(1000px circle at ${yPct}% ${100 - xPct}%, rgba(99, 102, 241, 0.28), transparent 70%)`;
    }
    if (orb1) orb1.style.transform = `translate(${dx * 0.9}px, ${dy * 0.9}px)`;
    if (orb2) orb2.style.transform = `translate(${-dx * 1.1}px, ${-dy * 1.1}px)`;
    if (orb3) orb3.style.transform = `translate(${dx * 0.5}px, ${dy * 0.5}px)`;
  }

  window.addEventListener('mousemove', (e) => {
    updateMouseGradient(e.clientX, e.clientY);
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      updateMouseGradient(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  // Discord Copy
  document.getElementById('btn-discord').addEventListener('click', () => {
    navigator.clipboard.writeText('prodbymdottyy2').then(() => {
      showToast('Discord Tag (prodbymdottyy2) copied to clipboard!');
    }).catch(() => {
      showToast('Discord: prodbymdottyy2');
    });
  });
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initSync();
  renderAll();
  setupEventListeners();
  startVisualizer();
});
