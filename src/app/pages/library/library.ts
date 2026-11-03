import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../components/icon';
import { EXERCISE_LIST } from '../../data/exercises';
import { Exercise, MuscleId } from '../../models';

const GROUPS: { label: string; muscles: MuscleId[] }[] = [
  { label: 'Jambes', muscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
  { label: 'Pectoraux, épaules, triceps', muscles: ['chest', 'shoulders', 'triceps'] },
  { label: 'Dos et biceps', muscles: ['lats', 'traps', 'biceps', 'forearms'] },
  { label: 'Abdos', muscles: ['abs', 'obliques', 'lowerBack'] },
];

const WARMUP_IDS = new Set(['treadmill', 'cat-cow', 'hip-flexor', 'worlds-greatest']);

/** Cardio et étirements d'un côté, puis les exercices de force rangés par muscle principal. */
function groupExercises(list: Exercise[]): { label: string; exercises: Exercise[] }[] {
  const warmup = list.filter((e) => WARMUP_IDS.has(e.id));
  const strength = list.filter((e) => !warmup.includes(e));
  return [
    { label: 'Cardio et mobilité', exercises: warmup },
    ...GROUPS.map((g) => ({
      label: g.label,
      exercises: strength.filter((e) => g.muscles.includes(e.muscles.primary[0])),
    })),
  ].filter((g) => g.exercises.length > 0);
}

@Component({
  selector: 'app-library',
  imports: [Icon, RouterLink],
  template: `
    <header class="page-header">
      <h1 class="large-title">Exercices</h1>
    </header>
    @for (group of groups; track group.label) {
      <p class="list-header">{{ group.label }}</p>
      <div class="list" style="--separator-inset: 80px">
        @for (ex of group.exercises; track ex.id) {
          <a class="row" [routerLink]="['/exercices', ex.id]">
            @if (ex.images.length) {
              <img class="thumb" [src]="ex.images[0]" alt="" crossorigin="anonymous" loading="lazy" />
            } @else {
              <span class="thumb thumb-empty"></span>
            }
            <span class="grow">
              <span class="title">{{ ex.name }}</span>
              <span class="subtitle">{{ ex.equipment }}</span>
            </span>
            <app-icon class="chevron" name="chevronRight" />
          </a>
        }
      </div>
    }
    <p class="muted footnote credits">
      Images :
      <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener">free-exercise-db</a>
      (domaine public)
    </p>
  `,
  styles: `
    .credits {
      margin: 24px 16px 0;
      text-align: center;
    }
  `,
})
export class Library {
  protected readonly groups = groupExercises(EXERCISE_LIST);
}
