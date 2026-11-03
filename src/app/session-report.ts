import { EntryLog, WorkoutLog } from './models';

/**
 * Bilan d'un exercice dans une séance :
 * - done : toutes les séries faites
 * - partial : une partie des séries faites
 * - skipped : passé sans faire de série
 * - notReached : jamais atteint, la séance a été arrêtée avant
 */
export type EntryStatus = 'done' | 'partial' | 'skipped' | 'notReached';

export function entryStatus(log: WorkoutLog, index: number): EntryStatus {
  const entry = log.entries[index];
  const done = entry.sets.filter((s) => s.done).length;
  if (done === entry.sets.length) return 'done';
  if (done > 0) return 'partial';
  return log.stoppedAt !== undefined && index >= log.stoppedAt ? 'notReached' : 'skipped';
}

/** Exercices qui comptent dans le bilan : musculation et bonus, hors tapis. */
export function isCountedExercise(entry: EntryLog): boolean {
  return (entry.block === 'strength' || entry.block === 'bonus') && entry.exerciseId !== 'treadmill';
}
