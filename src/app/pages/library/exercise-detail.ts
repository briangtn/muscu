import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExerciseGuide } from '../../components/exercise-guide';
import { Icon } from '../../components/icon';
import { EXERCISE_LIST } from '../../data/exercises';

@Component({
  selector: 'app-exercise-detail',
  imports: [ExerciseGuide, Icon, RouterLink],
  template: `
    <a routerLink="/exercices" class="back-link"><app-icon name="chevronLeft" /> Exercices</a>
    @if (exercise(); as ex) {
      <app-exercise-guide class="guide" [exercise]="ex" />
    } @else {
      <p class="muted">Exercice introuvable.</p>
    }
  `,
  styles: `
    .guide {
      margin-top: 12px;
    }
  `,
})
export class ExerciseDetail {
  /** Paramètre de route `:id`. */
  readonly id = input.required<string>();
  protected readonly exercise = computed(() => EXERCISE_LIST.find((e) => e.id === this.id()));
}
