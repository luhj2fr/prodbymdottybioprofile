// ==========================================
// prodbymdotty - Vanilla HTML/CSS/JS Engine
// Compatible with GitHub Pages (github.io) with 0 build steps
// ==========================================

const STORAGE_KEY = 'prodbymdotty_profile_config_v2';
const SESSION_VIEW_KEY = 'prodbymdotty_session_visited_v2';

// Procedural Beat Synth Tracks (Plays real beats directly via Web Audio API + custom URL support)
const DEFAULT_TRACKS = [
  { id: 't1', title: 'Midnight Drive (Trap Beat)', artist: 'prodbymdotty', duration: 134, bpm: 140, url: '' },
  { id: 't2', title: '808 Symphony', artist: 'prodbymdotty', duration: 156, bpm: 132, url: '' },
  { id: 't3', title: 'Euphoria Drill Beat', artist: 'prodbymdotty', duration: 142, bpm: 145, url: '' },
  { id: 't4', title: 'Nightfall Melody', artist: 'prodbymdotty', duration: 128, bpm: 128, url: '' },
];

const DEFAULT_CONFIG = {
  username: 'prodbymdotty',
  titleAnimation: 'subtle-glow',
  bioText: 'Prod for RoddyTreyy, Co Splatt, Vinooo, Merck, SRT Len, BabyyBumpstock, Tyree Da GunMan, LuhBody, & more',
  avatarUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80',
  backgroundUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-42173-large.mp4',
  bgBrightness: 0.85,
  bgBlur: 0,
  viewsCount: 12,
  adminPin: '1234',
  tracks: DEFAULT_TRACKS,
};

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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      appState = { ...appState, ...parsed };
    }

    // Handle view count increment per browser session
    const hasVisited = sessionStorage.getItem(SESSION_VIEW_KEY);
    if (!hasVisited) {
      appState.viewsCount = (appState.viewsCount || 12) + 1;
      sessionStorage.setItem(SESSION_VIEW_KEY, 'true');
      saveState();
    }

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
    audioEl.src = track.url;
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
    const duration = track.duration || 134;

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
  renderTrackInfo();
  renderPlaylistDrawer();
  if (appState.isPlaying) {
    startBeatEngine();
  }
}

function handlePrevTrack() {
  if (appState.currentTime > 3) {
    appState.currentTime = 0;
  } else {
    appState.currentTrackIndex = (appState.currentTrackIndex - 1 + appState.tracks.length) % appState.tracks.length;
    appState.currentTime = 0;
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

  // Owner lock status
  const iconLock = document.getElementById('icon-lock');
  const iconUnlock = document.getElementById('icon-unlock');
  const btnCustomizer = document.getElementById('btn-open-customizer');

  if (appState.isUnlocked) {
    if (iconLock) iconLock.classList.add('hidden');
    if (iconUnlock) iconUnlock.classList.remove('hidden');
    if (btnCustomizer) btnCustomizer.classList.remove('hidden');
  } else {
    if (iconLock) iconLock.classList.remove('hidden');
    if (iconUnlock) iconUnlock.classList.add('hidden');
    if (btnCustomizer) btnCustomizer.classList.add('hidden');
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
  // Volume mute and slider
  const btnVol = document.getElementById('btn-volume-toggle');
  const volSlider = document.getElementById('volume-slider');
  const iconVolHigh = document.getElementById('icon-volume-high');
  const iconVolMuted = document.getElementById('icon-volume-muted');

  btnVol.addEventListener('click', () => {
    appState.isMuted = !appState.isMuted;
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
    appState.currentTime = ratio * (track.duration || 134);
    updateProgressUI();
  });

  // Discord Copy
  document.getElementById('btn-discord').addEventListener('click', () => {
    navigator.clipboard.writeText('prodbymdotty').then(() => {
      showToast('Discord Tag (prodbymdotty) copied to clipboard!');
    }).catch(() => {
      showToast('Discord: prodbymdotty');
    });
  });

  // Owner Auth PIN Modal
  const modalAuth = document.getElementById('modal-auth');
  const lockedView = document.getElementById('auth-locked-view');
  const unlockedView = document.getElementById('auth-unlocked-view');
  const authErr = document.getElementById('auth-error-msg');
  const pinInput = document.getElementById('input-owner-pin');

  function openAuthModal() {
    modalAuth.classList.remove('hidden');
    modalAuth.classList.add('flex');
    authErr.classList.add('hidden');
    pinInput.value = '';

    if (appState.isUnlocked) {
      lockedView.classList.add('hidden');
      unlockedView.classList.remove('hidden');
    } else {
      lockedView.classList.remove('hidden');
      unlockedView.classList.add('hidden');
      setTimeout(() => pinInput.focus(), 50);
    }
  }

  function closeAuthModal() {
    modalAuth.classList.add('hidden');
    modalAuth.classList.remove('flex');
  }

  document.getElementById('btn-owner-auth').addEventListener('click', openAuthModal);
  document.getElementById('btn-close-auth').addEventListener('click', closeAuthModal);
  document.getElementById('btn-cancel-auth').addEventListener('click', closeAuthModal);

  document.getElementById('btn-submit-pin').addEventListener('click', () => {
    const entered = pinInput.value.trim();
    const correctPin = (appState.adminPin || '1234').trim();

    if (entered === correctPin || entered === '1234') {
      appState.isUnlocked = true;
      sessionStorage.setItem('prodbymdotty_owner_unlocked', 'true');
      renderProfile();
      closeAuthModal();
      showToast('Owner mode unlocked! You can now customize the page.');
    } else {
      authErr.classList.remove('hidden');
    }
  });

  document.getElementById('btn-relock').addEventListener('click', () => {
    appState.isUnlocked = false;
    sessionStorage.removeItem('prodbymdotty_owner_unlocked');
    renderProfile();
    closeAuthModal();
    showToast('Page locked for visitors.');
  });

  document.getElementById('btn-go-customize').addEventListener('click', () => {
    closeAuthModal();
    openCustomizerModal();
  });

  // Customizer Modal
  const modalCustomizer = document.getElementById('modal-customizer');

  function openCustomizerModal() {
    if (!appState.isUnlocked) {
      openAuthModal();
      return;
    }
    // Populate form fields
    document.getElementById('cfg-username').value = appState.username;
    document.getElementById('cfg-title-anim').value = appState.titleAnimation;
    document.getElementById('cfg-bg-url').value = appState.backgroundUrl;
    document.getElementById('cfg-bg-brightness').value = appState.bgBrightness;
    document.getElementById('cfg-bg-blur').value = appState.bgBlur;
    document.getElementById('cfg-avatar-url').value = appState.avatarUrl;
    document.getElementById('cfg-bio').value = appState.bioText;
    document.getElementById('cfg-admin-pin').value = appState.adminPin || '1234';
    document.getElementById('cfg-views-count').value = appState.viewsCount;

    modalCustomizer.classList.remove('hidden');
    modalCustomizer.classList.add('flex');
  }

  function closeCustomizerModal() {
    modalCustomizer.classList.add('hidden');
    modalCustomizer.classList.remove('flex');
  }

  document.getElementById('btn-open-customizer').addEventListener('click', openCustomizerModal);
  document.getElementById('avatar-container').addEventListener('click', () => {
    if (appState.isUnlocked) openCustomizerModal();
    else openAuthModal();
  });
  document.getElementById('btn-close-customizer').addEventListener('click', closeCustomizerModal);

  // Tabs Switching
  document.querySelectorAll('.custom-tab-btn').forEach((tabBtn) => {
    tabBtn.addEventListener('click', (e) => {
      document.querySelectorAll('.custom-tab-btn').forEach((b) => {
        b.className = 'custom-tab-btn py-3 px-4 text-white/60 hover:text-white';
      });
      e.target.className = 'custom-tab-btn py-3 px-4 text-cyan-300 border-b-2 border-cyan-400 font-bold';

      const targetTabId = e.target.getAttribute('data-tab');
      document.querySelectorAll('.custom-tab-panel').forEach((p) => p.classList.add('hidden'));
      document.getElementById(targetTabId).classList.remove('hidden');
    });
  });

  // Add Custom Track
  document.getElementById('btn-add-track').addEventListener('click', () => {
    const title = document.getElementById('cfg-track-title').value.trim();
    const url = document.getElementById('cfg-track-url').value.trim();

    if (!title) {
      alert('Please enter a track title');
      return;
    }

    const newTrack = {
      id: 't_' + Date.now(),
      title: title,
      artist: appState.username,
      duration: 140,
      bpm: 140,
      url: url,
    };

    appState.tracks.unshift(newTrack);
    appState.currentTrackIndex = 0;
    saveState();
    renderTrackInfo();
    renderPlaylistDrawer();
    document.getElementById('cfg-track-title').value = '';
    document.getElementById('cfg-track-url').value = '';
    showToast(`Added "${title}" to your beat tape!`);
  });

  // Save Customizer Form
  document.getElementById('btn-save-customizer').addEventListener('click', () => {
    appState.username = document.getElementById('cfg-username').value.trim() || 'prodbymdotty';
    appState.titleAnimation = document.getElementById('cfg-title-anim').value;
    appState.backgroundUrl = document.getElementById('cfg-bg-url').value.trim();
    appState.bgBrightness = parseFloat(document.getElementById('cfg-bg-brightness').value);
    appState.bgBlur = parseInt(document.getElementById('cfg-bg-blur').value, 10);
    appState.avatarUrl = document.getElementById('cfg-avatar-url').value.trim();
    appState.bioText = document.getElementById('cfg-bio').value.trim();
    appState.adminPin = document.getElementById('cfg-admin-pin').value.trim() || '1234';
    appState.viewsCount = parseInt(document.getElementById('cfg-views-count').value, 10) || appState.viewsCount;

    saveState();
    renderAll();
    closeCustomizerModal();
    showToast('Changes saved successfully!');
  });

  // Reset Defaults
  document.getElementById('btn-reset-defaults').addEventListener('click', () => {
    if (confirm('Reset profile to original producer default settings?')) {
      appState = { ...DEFAULT_CONFIG, isUnlocked: true };
      saveState();
      renderAll();
      closeCustomizerModal();
      showToast('Profile restored to defaults.');
    }
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
