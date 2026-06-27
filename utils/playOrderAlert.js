const ALERT_SOURCES = ["/original_iphone.mp3", "/alert.wav"];

let audioCtx = null;
let pendingLoopAudio = null;
let activeSourceIndex = 0;
let audioUnlocked = false;
let soundBlocked = false;
let shouldPlayRingtone = false;
let blockListeners = new Set();

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function notifyBlockChange() {
  blockListeners.forEach((fn) => fn(soundBlocked));
}

export function onSoundBlockChange(listener) {
  blockListeners.add(listener);
  listener(soundBlocked);
  return () => blockListeners.delete(listener);
}

export function isSoundBlocked() {
  return soundBlocked;
}

function destroyLoopAudio() {
  if (!pendingLoopAudio) return;
  pendingLoopAudio.loop = false;
  pendingLoopAudio.onended = null;
  pendingLoopAudio.pause();
  pendingLoopAudio.currentTime = 0;
  pendingLoopAudio.removeAttribute("src");
  pendingLoopAudio.load();
  pendingLoopAudio = null;
}

function createLoopAudio(src) {
  const audio = new Audio(src);
  audio.loop = true;
  audio.volume = 1;
  audio.preload = "auto";
  return audio;
}

function getPendingLoopAudio() {
  if (!pendingLoopAudio) {
    pendingLoopAudio = createLoopAudio(ALERT_SOURCES[activeSourceIndex]);
  }
  return pendingLoopAudio;
}

function resetPendingLoopAudio(nextIndex = 0) {
  destroyLoopAudio();
  activeSourceIndex = nextIndex;
}

export async function unlockOrderAlertAudio() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume().catch(() => {});
  }

  for (const src of ALERT_SOURCES) {
    try {
      const probe = new Audio(src);
      probe.volume = 0.01;
      probe.preload = "auto";
      await probe.play();
      probe.pause();
      probe.currentTime = 0;
      probe.src = "";
      audioUnlocked = true;
      soundBlocked = false;
      notifyBlockChange();
      return true;
    } catch {
      /* try next source */
    }
  }

  return false;
}

export async function startPendingOrderAlert() {
  if (!shouldPlayRingtone) {
    stopPendingOrderAlert();
    return { ok: true, blocked: false };
  }

  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume().catch(() => {});
  }

  for (let i = 0; i < ALERT_SOURCES.length; i += 1) {
    try {
      if (i !== activeSourceIndex || !pendingLoopAudio) {
        resetPendingLoopAudio(i);
      }

      const audio = getPendingLoopAudio();
      audio.loop = true;
      audio.volume = 1;
      if (audio.paused) {
        audio.currentTime = 0;
        await audio.play();
      }
      audioUnlocked = true;
      soundBlocked = false;
      notifyBlockChange();
      return { ok: true, blocked: false };
    } catch {
      resetPendingLoopAudio(i + 1);
    }
  }

  soundBlocked = true;
  notifyBlockChange();

  if (audioUnlocked) {
    await playFallbackBeep();
    return { ok: true, blocked: false };
  }

  return { ok: false, blocked: true };
}

export function stopPendingOrderAlert() {
  shouldPlayRingtone = false;
  destroyLoopAudio();
}

export function setPendingRingtoneActive(active) {
  shouldPlayRingtone = active;
  if (!active) {
    stopPendingOrderAlert();
  }
}

export function isPendingOrderAlertPlaying() {
  return Boolean(shouldPlayRingtone && pendingLoopAudio && !pendingLoopAudio.paused);
}

async function playFallbackBeep() {
  if (!shouldPlayRingtone) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state !== "running") {
      await ctx.resume();
    }

    const start = ctx.currentTime + 0.02;
    const playTone = (freq, at, dur, vol) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = start + at;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    };

    playTone(880, 0, 0.35, 0.45);
    playTone(659.25, 0.4, 0.45, 0.5);
  } catch {
    /* ignore */
  }
}

/** @deprecated use startPendingOrderAlert */
export async function playOrderAlert() {
  return startPendingOrderAlert();
}
