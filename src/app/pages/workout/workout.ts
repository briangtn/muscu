import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ExerciseGuide } from '../../components/exercise-guide';
import { Icon } from '../../components/icon';
import { Stepper } from '../../components/stepper';
import { exercise } from '../../data/exercises';
import { PROGRAM } from '../../data/program';
import { alertUser, keepScreenOn } from '../../device';
import { describeStep, formatClock, formatDuration, minutesBetween } from '../../format';
import { BLOCK_LABELS, SetLog } from '../../models';
import { WorkoutStore } from '../../workout-store';

const secondsLeft = (endsAt: number, now: number) => Math.max(0, Math.ceil((endsAt - now) / 1000));
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 88;
const REST_CIRCUMFERENCE = 2 * Math.PI * 20;

@Component({
  selector: 'app-workout',
  imports: [ExerciseGuide, Icon, RouterLink, Stepper],
  templateUrl: './workout.html',
  styleUrl: './workout.scss',
})
export class Workout {
  private readonly store = inject(WorkoutStore);
  private readonly router = inject(Router);

  protected readonly log = this.store.current;
  protected readonly template = computed(() => {
    const log = this.log();
    return log ? PROGRAM[log.templateId] : null;
  });
  protected readonly cursor = computed(() => this.log()?.cursor ?? 0);
  protected readonly isLastStep = computed(() => this.cursor() + 1 === this.template()?.steps.length);
  protected readonly step = computed(() => this.template()?.steps[this.cursor()]);
  protected readonly entry = computed(() => this.log()?.entries[this.cursor()]);
  protected readonly exercise = computed(() => {
    const step = this.step();
    return step ? exercise(step.exerciseId) : undefined;
  });
  protected readonly nextExercise = computed(() => {
    const next = this.template()?.steps[this.cursor() + 1];
    return next ? exercise(next.exerciseId) : undefined;
  });
  protected readonly suggestion = computed(() => {
    const step = this.step();
    return step ? this.store.suggest(step) : null;
  });
  protected readonly activeSet = computed(() => this.entry()?.sets.findIndex((s) => !s.done) ?? -1);
  /** Une barre par étape : faite, en cours ou à venir. */
  protected readonly segments = computed(() => {
    const log = this.log();
    if (!log) return [];
    return log.entries.map((entry, i) =>
      i === log.cursor ? 'current' : entry.sets.some((s) => s.done) || i < log.cursor ? 'done' : '',
    );
  });

  private readonly now = signal(Date.now());
  protected readonly restEndsAt = signal<number | null>(null);
  private readonly restTotal = signal(0);
  protected readonly restLeft = computed(() => secondsLeft(this.restEndsAt() ?? 0, this.now()));
  protected readonly restOffset = computed(
    () => REST_CIRCUMFERENCE * (1 - this.restLeft() / Math.max(1, this.restTotal())),
  );
  protected readonly timerEndsAt = signal<number | null>(null);
  private readonly timerPausedLeft = signal<number | null>(null);
  protected readonly timerPaused = computed(() => this.timerPausedLeft() !== null);
  protected readonly timerLeft = computed(() => {
    const endsAt = this.timerEndsAt();
    if (endsAt !== null) return secondsLeft(endsAt, this.now());
    return this.timerPausedLeft() ?? this.step()?.durationSec ?? 0;
  });
  protected readonly timerOffset = computed(
    () => TIMER_CIRCUMFERENCE * (1 - this.timerLeft() / Math.max(1, this.step()?.durationSec ?? 1)),
  );
  /** Flash visuel en fin de repos : l'iPhone ne vibre pas depuis le web. */
  protected readonly flash = signal(false);

  protected readonly doneSets = computed(
    () => this.log()?.entries.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0) ?? 0,
  );
  protected readonly doneExercises = computed(
    () => this.log()?.entries.filter((e) => e.block === 'strength' && e.sets.some((s) => s.done)).length ?? 0,
  );
  protected readonly elapsedMin = computed(() => {
    const log = this.log();
    return log ? minutesBetween(log.startedAt, new Date(this.now()).toISOString()) : 0;
  });

  protected readonly timerCircumference = TIMER_CIRCUMFERENCE;
  protected readonly restCircumference = REST_CIRCUMFERENCE;
  protected readonly blockLabels = BLOCK_LABELS;
  protected readonly describeStep = describeStep;
  protected readonly formatClock = formatClock;
  protected readonly formatDuration = formatDuration;

  constructor() {
    if (!this.log()) {
      this.router.navigate(['/']);
      return;
    }
    // Les minuteurs reposent sur des horodatages : ils restent justes si le téléphone se met en veille.
    const tick = setInterval(() => this.tick(), 250);
    const releaseScreen = keepScreenOn();
    inject(DestroyRef).onDestroy(() => {
      clearInterval(tick);
      releaseScreen();
    });
  }

  protected update(setIndex: number, field: 'weight' | 'reps' | 'speed' | 'incline', value: number | null): void {
    // La valeur saisie s'applique aussi aux séries suivantes pas encore faites.
    this.entry()?.sets.forEach((set, i) => {
      if (i >= setIndex && !set.done) this.store.updateSet(this.cursor(), i, { [field]: value });
    });
  }

  protected toggleSet(setIndex: number): void {
    const done = !this.entry()?.sets[setIndex].done;
    this.store.updateSet(this.cursor(), setIndex, { done });
    if (done) this.startRest();
  }

  protected startTimer(): void {
    this.timerEndsAt.set(Date.now() + this.timerLeft() * 1000);
    this.timerPausedLeft.set(null);
  }

  protected pauseTimer(): void {
    this.timerPausedLeft.set(this.timerLeft());
    this.timerEndsAt.set(null);
  }

  protected completeTimedSet(): void {
    const setIndex = this.activeSet();
    const planned = this.step()?.durationSec ?? 0;
    if (setIndex < 0) return;
    const done: Partial<SetLog> = { done: true, durationSec: planned - this.timerLeft() || planned };
    this.resetTimer();
    this.store.updateSet(this.cursor(), setIndex, done);
    this.signalEnd();
    this.startRest();
  }

  protected addRest(seconds: number): void {
    this.restEndsAt.update((endsAt) => (endsAt ?? Date.now()) + seconds * 1000);
    this.restTotal.update((total) => total + seconds);
  }

  protected skipRest(): void {
    this.restEndsAt.set(null);
  }

  protected goTo(index: number): void {
    this.resetTimer();
    this.store.setCursor(index);
    window.scrollTo({ top: 0 });
  }

  protected finish(): void {
    this.store.finish();
    this.router.navigate(['/']);
  }

  protected setLabel(setIndex: number, durationSec: number, perSide: boolean): string {
    const side = perSide ? (setIndex % 2 === 0 ? ' · côté gauche' : ' · côté droit') : '';
    return `${formatDuration(durationSec)}${side}`;
  }

  private startRest(): void {
    const restSec = this.step()?.restSec ?? 0;
    if (restSec <= 0) return;
    this.restTotal.set(restSec);
    this.restEndsAt.set(Date.now() + restSec * 1000);
  }

  private resetTimer(): void {
    this.timerEndsAt.set(null);
    this.timerPausedLeft.set(null);
  }

  private signalEnd(): void {
    alertUser();
    this.flash.set(true);
    setTimeout(() => this.flash.set(false), 1200);
  }

  private tick(): void {
    const now = Date.now();
    this.now.set(now);
    const restEndsAt = this.restEndsAt();
    if (restEndsAt !== null && now >= restEndsAt) {
      this.restEndsAt.set(null);
      this.signalEnd();
    }
    const timerEndsAt = this.timerEndsAt();
    if (timerEndsAt !== null && now >= timerEndsAt) this.completeTimedSet();
  }
}
