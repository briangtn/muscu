/** Vibration + bip court pour signaler la fin d'un repos ou d'un minuteur. */
export function alertUser(): void {
  navigator.vibrate?.([200, 100, 200]);
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.frequency.value = 880;
    gain.gain.value = 0.2;
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.onended = () => ctx.close();
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio indisponible : la vibration suffit.
  }
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
