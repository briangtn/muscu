import { SessionTemplate, Step, TemplateId } from '../models';

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
  },
};
