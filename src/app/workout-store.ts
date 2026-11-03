import { computed, effect, Injectable, signal } from '@angular/core';
import { exercise } from './data/exercises';
import { PROGRAM } from './data/program';
import { EntryLog, SetLog, Step, TemplateId, WorkoutLog } from './models';
import { suggest, Suggestion } from './progression';

const HISTORY_KEY = 'muscu.history.v1';
const CURRENT_KEY = 'muscu.current.v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Une séance commencée avec une ancienne version du programme ne peut pas être reprise. */
function matchesProgram(log: WorkoutLog | null): WorkoutLog | null {
  const steps = log ? PROGRAM[log.templateId]?.steps : undefined;
  const matches =
    !!steps &&
    log!.entries.length === steps.length &&
    log!.entries.every((entry, i) => entry.exerciseId === steps[i].exerciseId && entry.block === steps[i].block);
  return matches ? log : null;
}

function write(key: string, value: unknown): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Stockage indisponible (navigation privée) : l'app fonctionne sans persistance.
  }
}

@Injectable({ providedIn: 'root' })
export class WorkoutStore {
  private readonly historySignal = signal<WorkoutLog[]>(read(HISTORY_KEY, []));
  private readonly currentSignal = signal<WorkoutLog | null>(matchesProgram(read(CURRENT_KEY, null)));

  readonly history = this.historySignal.asReadonly();
  readonly current = this.currentSignal.asReadonly();
  readonly nextTemplate = computed(() => PROGRAM[this.historySignal().at(-1)?.templateId === 'A' ? 'B' : 'A']);

  constructor() {
    effect(() => write(HISTORY_KEY, this.historySignal()));
    effect(() => write(CURRENT_KEY, this.currentSignal()));
    // Demande au navigateur de ne pas purger les données en cas de manque d'espace.
    navigator.storage?.persist?.().catch(() => undefined);
  }

  suggest(step: Step): Suggestion {
    return suggest(step, exercise(step.exerciseId), this.lastEntry(step));
  }

  start(templateId: TemplateId): void {
    const entries = PROGRAM[templateId].steps.map((step): EntryLog => {
      const s = this.suggest(step);
      return {
        exerciseId: step.exerciseId,
        block: step.block,
        sets: Array.from({ length: step.sets }, () => ({
          weight: s.weight,
          reps: s.reps,
          durationSec: s.durationSec,
          speed: s.speed,
          incline: s.incline,
          done: false,
        })),
      };
    });
    this.currentSignal.set({
      id: crypto.randomUUID(),
      templateId,
      startedAt: new Date().toISOString(),
      cursor: 0,
      entries,
    });
  }

  updateSet(entryIndex: number, setIndex: number, patch: Partial<SetLog>): void {
    this.currentSignal.update(
      (log) =>
        log && {
          ...log,
          entries: log.entries.map((entry, i) =>
            i !== entryIndex
              ? entry
              : { ...entry, sets: entry.sets.map((set, j) => (j !== setIndex ? set : { ...set, ...patch })) },
          ),
        },
    );
  }

  setCursor(cursor: number): void {
    this.currentSignal.update((log) => log && { ...log, cursor });
  }

  finish(): void {
    const log = this.currentSignal();
    if (!log) return;
    this.historySignal.update((history) => [...history, { ...log, finishedAt: new Date().toISOString() }]);
    this.currentSignal.set(null);
  }

  abandon(): void {
    this.currentSignal.set(null);
  }

  private lastEntry(step: Step): EntryLog | undefined {
    const history = this.historySignal();
    for (let i = history.length - 1; i >= 0; i--) {
      const entry = history[i].entries.find(
        (e) => e.exerciseId === step.exerciseId && e.block === step.block && e.sets.some((s) => s.done),
      );
      if (entry) return entry;
    }
    return undefined;
  }
}
