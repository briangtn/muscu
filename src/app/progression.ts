import { EntryLog, Exercise, Step } from './models';
import { formatKg, formatSpeed } from './format';

export interface Suggestion {
  weight: number | null;
  reps: number | null;
  durationSec: number | null;
  speed: number | null;
  incline: number | null;
  message: string;
  progressed: boolean;
}

const NONE = { weight: null, reps: null, durationSec: null, speed: null, incline: null, message: '', progressed: false };

/**
 * Double progression : on garde la charge et on ajoute des reps jusqu'à réussir
 * toutes les séries au haut de la fourchette, puis on monte d'un palier et on repart du bas.
 */
export function suggest(step: Step, exercise: Exercise, last: EntryLog | undefined): Suggestion {
  if (exercise.tracksSpeed) {
    // Au tapis, on repart de la vitesse et de la pente de la dernière fois.
    const previous = last?.sets.find((s) => s.done && s.speed !== null);
    const speed = previous?.speed ?? step.speed ?? null;
    const incline = previous?.incline ?? step.incline ?? null;
    return {
      ...NONE,
      durationSec: step.durationSec ?? null,
      speed,
      incline,
      message: previous ? `Dernière fois : ${formatSpeed(speed)}, pente ${incline ?? '?'} %.` : '',
    };
  }

  if (exercise.kind === 'timed') {
    return { ...NONE, durationSec: step.durationSec ?? null };
  }

  const repsMin = step.repsMin ?? 8;
  const repsMax = step.repsMax ?? repsMin;
  const done = (last?.sets ?? []).filter((s) => s.done && s.reps !== null);

  if (done.length === 0) {
    return {
      ...NONE,
      reps: repsMin,
      message:
        exercise.kind === 'weighted'
          ? `Première fois : choisis une charge avec laquelle tu fais ${repsMin} reps propres en gardant 2 reps en réserve.`
          : '',
      progressed: false,
    };
  }

  const lastWeight = exercise.kind === 'weighted' ? (done[0].weight ?? null) : null;
  const repsList = done.map((s) => s.reps).join(', ');
  const previous = lastWeight !== null ? `${formatKg(lastWeight)} × ${repsList}` : `${repsList} reps`;
  const topReached = done.length >= step.sets && done.every((s) => (s.reps ?? 0) >= repsMax);

  if (topReached && lastWeight !== null && exercise.increment) {
    const weight = lastWeight + exercise.increment;
    return {
      ...NONE,
      weight,
      reps: repsMin,
      message: `Dernière fois : ${previous}. Objectif atteint, on passe à ${formatKg(weight)} et on repart à ${repsMin} reps.`,
      progressed: true,
    };
  }

  const minDone = Math.min(...done.map((s) => s.reps ?? 0));
  const reps = Math.min(repsMax, Math.max(repsMin, minDone + 1));
  return {
    ...NONE,
    weight: lastWeight,
    reps,
    message: topReached
      ? `Dernière fois : ${previous}. Objectif atteint, soigne la technique et le contrôle.`
      : `Dernière fois : ${previous}. Vise ${reps} reps par série.`,
  };
}
