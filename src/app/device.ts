let audio: AudioContext | undefined;

/**
 * iOS n'autorise le son qu'après un geste de l'utilisateur et suspend l'audio en arrière-plan :
 * on crée le contexte au premier toucher et on le réveille à chaque toucher suivant.
 */
export function unlockAudioOnTouch(): void {
  const unlock = () => {
    try {
      audio ??= new AudioContext();
      if (audio.state !== 'running') audio.resume().catch(() => undefined);
    } catch {
      // Pas de Web Audio : l'app reste silencieuse.
    }
  };
  document.addEventListener('pointerdown', unlock, { capture: true, passive: true });
}

/** Une note douce façon clochette : sinus + harmonique, attaque courte, extinction progressive. */
function bell(ctx: AudioContext, frequency: number, start: number, duration: number, volume = 0.18): void {
  for (const [ratio, level] of [
    [1, 1],
    [2, 0.25],
  ]) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = ratio === 1 ? 'triangle' : 'sine';
    oscillator.frequency.value = frequency * ratio;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume * level, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }
}

function play(notes: [frequency: number, delay: number, duration: number][]): void {
  if (!audio || audio.state !== 'running') return;
  const now = audio.currentTime + 0.02;
  for (const [frequency, delay, duration] of notes) bell(audio, frequency, now + delay, duration);
}

const C6 = 1046.5;
const E6 = 1318.5;
const G6 = 1568;
const C7 = 2093;

/** Fin d'un repos ou d'un chrono : petit arpège montant joyeux + vibration. */
export function alertUser(): void {
  navigator.vibrate?.([120, 60, 120]);
  play([
    [C6, 0, 0.25],
    [E6, 0.09, 0.25],
    [G6, 0.18, 0.5],
  ]);
}

/** Fin de séance : mini fanfare qui finit sur un accord. */
export function celebrate(): void {
  navigator.vibrate?.([80, 60, 80, 60, 200]);
  play([
    [C6 / 2, 0, 0.2],
    [E6 / 2, 0.11, 0.2],
    [G6 / 2, 0.22, 0.2],
    [C6, 0.33, 0.9],
    [E6, 0.33, 0.9],
    [G6, 0.33, 0.9],
    [C7, 0.45, 1.1],
  ]);
}

/** Garde l'écran allumé pendant la séance. Retourne la fonction de libération. */
export function keepScreenOn(): () => void {
  let sentinel: WakeLockSentinel | undefined;
  const acquire = () => {
    if (document.visibilityState !== 'visible') return;
    navigator.wakeLock
      ?.request('screen')
      .then((s) => (sentinel = s))
      .catch(() => undefined);
  };
  acquire();
  // Le verrou est perdu quand l'onglet passe en arrière-plan.
  document.addEventListener('visibilitychange', acquire);
  return () => {
    document.removeEventListener('visibilitychange', acquire);
    sentinel?.release().catch(() => undefined);
  };
}
