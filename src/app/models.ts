export type ExerciseKind = 'weighted' | 'bodyweight' | 'timed';
export type BlockId = 'warmup' | 'mobility' | 'strength' | 'cardio' | 'bonus';
export type TemplateId = 'A' | 'B';
export type MuscleId =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'hipFlexors'
  | 'quads'
  | 'traps'
  | 'lats'
  | 'lowerBack'
  | 'glutes'
  | 'hamstrings'
  | 'calves';

export interface Exercise {
  id: string;
  name: string;
  kind: ExerciseKind;
  equipment: string;
  /** Positions de départ et d'arrivée, alternées pour former l'animation. */
  images: string[];
  cues: string[];
  mistakes: string[];
  muscles: { primary: MuscleId[]; secondary: MuscleId[] };
  /** Palier d'augmentation de charge en kg. */
  increment?: number;
  /** Les reps ou la durée se comptent par côté. */
  perSide?: boolean;
  /** On note la vitesse et la pente (tapis de course). */
  tracksSpeed?: boolean;
}

export interface Step {
  block: BlockId;
  exerciseId: string;
  sets: number;
  repsMin?: number;
  repsMax?: number;
  durationSec?: number;
  /** Valeurs par défaut au tapis, en km/h et en %. */
  speed?: number;
  incline?: number;
  restSec: number;
  note?: string;
}

export interface SessionTemplate {
  id: TemplateId;
  name: string;
  focus: string;
  steps: Step[];
  /** Exercices proposés en fin de séance quand on a encore de l'énergie. */
  bonus: Step[];
}

export interface SetLog {
  weight: number | null;
  reps: number | null;
  durationSec: number | null;
  speed: number | null;
  incline: number | null;
  done: boolean;
}

export interface EntryLog {
  exerciseId: string;
  /** Distingue le tapis d'échauffement du tapis de fin de séance. */
  block: BlockId;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  templateId: TemplateId;
  startedAt: string;
  finishedAt?: string;
  /** Index de l'étape en cours, pour reprendre une séance interrompue. */
  cursor: number;
  entries: EntryLog[];
  /** Exercices bonus ajoutés en fin de séance, à la suite des étapes du programme. */
  extraSteps?: Step[];
}

export const MUSCLE_LABELS: Record<MuscleId, string> = {
  chest: 'Pectoraux',
  shoulders: 'Épaules',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Avant-bras',
  abs: 'Abdominaux',
  obliques: 'Obliques',
  hipFlexors: 'Fléchisseurs de hanche',
  quads: 'Quadriceps',
  traps: 'Trapèzes',
  lats: 'Grands dorsaux',
  lowerBack: 'Lombaires',
  glutes: 'Fessiers',
  hamstrings: 'Ischio-jambiers',
  calves: 'Mollets',
};

export const BLOCK_LABELS: Record<BlockId, string> = {
  warmup: 'Échauffement',
  mobility: 'Mobilité',
  strength: 'Musculation',
  cardio: 'Cardio',
  bonus: 'Bonus',
};
