// Lazy-load expo-audio so a missing native module never crashes the game
let _createAudioPlayer = null;
let _setAudioModeAsync = null;
try {
  const expoAudio = require('expo-audio');
  _createAudioPlayer = expoAudio.createAudioPlayer;
  _setAudioModeAsync = expoAudio.setAudioModeAsync;
} catch (_) {
  // expo-audio native module unavailable — run in silent mode
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let sounds = {};
let soundEnabled = true;
let audioAvailable = !!_createAudioPlayer;

// ---------------------------------------------------------------------------
// Asset mapping — require() is evaluated at bundle time
// ---------------------------------------------------------------------------
let SOUND_ASSETS = {};
try {
  SOUND_ASSETS = {
    tap:       require('../../assets/sounds/tap.wav'),
    gem:       require('../../assets/sounds/gem.wav'),
    fail:      require('../../assets/sounds/fail.wav'),
    complete:  require('../../assets/sounds/complete.wav'),
    button:    require('../../assets/sounds/button.wav'),
    countdown: require('../../assets/sounds/countdown.wav'),
    perfect:   require('../../assets/sounds/perfect.wav'),
  };
} catch (_) { /* assets missing — silent mode */ }

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

/** Call once on app start to load all sound assets into memory. */
export async function preloadSounds() {
  if (!audioAvailable) return;
  try {
    await _setAudioModeAsync({ playsInSilentMode: true });
  } catch (_) { /* ignore */ }

  for (const [name, asset] of Object.entries(SOUND_ASSETS)) {
    try {
      sounds[name] = _createAudioPlayer(asset, { downloadFirst: true });
    } catch (e) {
      // failed to load this sound — continue without it
    }
  }
}

/** Call on app unmount / cleanup. */
export async function unloadSounds() {
  for (const key of Object.keys(sounds)) {
    try { sounds[key].remove(); } catch (_) { /* ignore */ }
  }
  sounds = {};
}

// ---------------------------------------------------------------------------
// Toggle
// ---------------------------------------------------------------------------

/** Set the global sound‑enabled flag (reads from saved settings). */
export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

/** Returns current sound state. */
export function isSoundEnabled() {
  return soundEnabled;
}

// ---------------------------------------------------------------------------
// Playback helpers
// ---------------------------------------------------------------------------

/**
 * Safe replay: stop → rewind → play.
 * Prevents overlap artifacts on rapid triggers.
 */
async function playSound(name) {
  if (!soundEnabled || !audioAvailable) return;
  try {
    const player = sounds[name];
    if (!player) return;
    player.pause();
    await player.seekTo(0);
    player.play();
  } catch (_) { /* ignore playback errors */ }
}

// ---------------------------------------------------------------------------
// Public play functions — one per event type
// ---------------------------------------------------------------------------

/** Successful turn */
export async function playTap()       { await playSound('tap'); }

/** Gem collected */
export async function playGem()       { await playSound('gem'); }

/** Missed turn / obstacle / game over */
export async function playFail()      { await playSound('fail'); }

/** Level complete fanfare */
export async function playComplete()  { await playSound('complete'); }

/** UI button press */
export async function playButton()    { await playSound('button'); }

/** Countdown tick */
export async function playCountdown() { await playSound('countdown'); }

/** Perfect‑timing reward */
export async function playPerfect()   { await playSound('perfect'); }
