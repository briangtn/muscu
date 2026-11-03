import { SessionTemplate, Step, TemplateId, WorkoutLog } from '../models';

const warmup: Step[] = [
  { block: 'warmup', exerciseId: 'treadmill', sets: 1, durationSec: 8 * 60, speed: 5, incline: 4, restSec: 0, note: 'Pente 3 à 5 %, marche rapide' },
];

const mobility: Step[] = [
  { block: 'mobility', exerciseId: 'cat-cow', sets: 1, durationSec: 60, restSec: 0 },
  { block: 'mobility', exerciseId: 'hip-flexor', sets: 2, durationSec: 30, restSec: 0, note: 'Une série par côté' },
  { block: 'mobility', exerciseId: 'worlds-greatest', sets: 1, durationSec: 60, restSec: 0 },
];

const cardio: Step[] = [
  { block: 'cardio', exerciseId: 'treadmill', sets: 1, durationSec: 10 * 60, speed: 5, incline: 10, restSec: 0, note: 'Pente 8 à 12 %, 4,5 à 5,5 km/h' },
];

const extraTreadmill: Step[] = [
  { block: 'bonus', exerciseId: 'treadmill', sets: 1, durationSec: 10 * 60, speed: 5.5, incline: 10, restSec: 0, note: 'Rab de marche inclinée' },
];

export const PROGRAM: Record<TemplateId, SessionTemplate> = {
  A: {
    id: 'A',
    name: 'Séance A',
    focus: 'Squat, développé couché, tirage vertical, épaules',
    steps: [
      ...warmup,
      ...mobility,
      { block: 'strength', exerciseId: 'goblet-squat', sets: 3, repsMin: 8, repsMax: 12, restSec: 120 },
      { block: 'strength', exerciseId: 'db-bench-press', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
      { block: 'strength', exerciseId: 'lat-pulldown', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
      { block: 'strength', exerciseId: 'db-shoulder-press', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
      { block: 'strength', exerciseId: 'leg-curl', sets: 3, repsMin: 10, repsMax: 12, restSec: 60 },
      { block: 'strength', exerciseId: 'cable-curl', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
      { block: 'strength', exerciseId: 'plank', sets: 2, durationSec: 30, restSec: 45 },
      ...cardio,
    ],
    // Complète la séance A : triceps, arrière d'épaules, quadriceps, mollets
    bonus: [
      { block: 'bonus', exerciseId: 'triceps-overhead', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
      { block: 'bonus', exerciseId: 'face-pull', sets: 2, repsMin: 12, repsMax: 15, restSec: 60 },
      { block: 'bonus', exerciseId: 'leg-extension', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
      { block: 'bonus', exerciseId: 'calf-raise', sets: 3, repsMin: 12, repsMax: 15, restSec: 45 },
      ...extraTreadmill,
    ],
  },
  B: {
    id: 'B',
    name: 'Séance B',
    focus: 'Presse, développé incliné, rowing, soulevé de terre roumain',
    steps: [
      ...warmup,
      ...mobility,
      { block: 'strength', exerciseId: 'leg-press', sets: 3, repsMin: 8, repsMax: 12, restSec: 120 },
      { block: 'strength', exerciseId: 'incline-db-press', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
      { block: 'strength', exerciseId: 'seated-row', sets: 3, repsMin: 8, repsMax: 12, restSec: 90 },
      { block: 'strength', exerciseId: 'db-rdl', sets: 3, repsMin: 10, repsMax: 12, restSec: 90, note: 'Commence léger pour bien apprendre le mouvement' },
      { block: 'strength', exerciseId: 'lateral-raise', sets: 2, repsMin: 12, repsMax: 15, restSec: 60 },
      { block: 'strength', exerciseId: 'triceps-pushdown', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
      { block: 'strength', exerciseId: 'crunch', sets: 2, repsMin: 15, repsMax: 20, restSec: 45 },
      ...cardio,
    ],
    // Complète la séance B : biceps, pectoraux, jambes en unilatéral, obliques
    bonus: [
      { block: 'bonus', exerciseId: 'hammer-curl', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
      { block: 'bonus', exerciseId: 'pec-deck', sets: 2, repsMin: 10, repsMax: 15, restSec: 60 },
      { block: 'bonus', exerciseId: 'lunges', sets: 2, repsMin: 8, repsMax: 12, restSec: 90 },
      { block: 'bonus', exerciseId: 'side-plank', sets: 2, durationSec: 30, restSec: 30, note: 'Une série par côté' },
      ...extraTreadmill,
    ],
  },
};

/** Étapes d'une séance : celles du programme puis les bonus ajoutés en route. */
export function stepsOf(log: WorkoutLog): Step[] {
  return [...PROGRAM[log.templateId].steps, ...(log.extraSteps ?? [])];
}
