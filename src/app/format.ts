import { Exercise, Step } from './models';

export function formatKg(kg: number): string {
  return `${kg.toLocaleString('fr-FR')} kg`;
}

export function formatSpeed(kmh: number | null): string {
  return kmh === null ? '? km/h' : `${kmh.toLocaleString('fr-FR')} km/h`;
}

export function formatClock(totalSec: number): string {
  const sec = Math.max(0, Math.round(totalSec));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

export function formatDuration(sec: number): string {
  if (sec < 60) return `${sec} s`;
  const min = Math.floor(sec / 60);
  const rest = sec % 60;
  return rest ? `${min} min ${rest}` : `${min} min`;
}

export function describeStep(step: Step, exercise: Exercise): string {
  const side = exercise.perSide ? ' par côté' : '';
  if (step.durationSec !== undefined) {
    const duration = formatDuration(step.durationSec);
    return step.sets > 1 ? `${step.sets} × ${duration}` : duration;
  }
  const reps = step.repsMin === step.repsMax ? `${step.repsMin}` : `${step.repsMin}-${step.repsMax}`;
  return `${step.sets} × ${reps}${side}`;
}

const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

export function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso));
}

export function minutesBetween(startIso: string, endIso: string): number {
  return Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);
}
