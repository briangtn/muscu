import { Component, input } from '@angular/core';
import { Exercise } from '../models';
import { ExerciseAnimation } from './exercise-animation';
import { ExerciseDetails } from './exercise-details';

/** Fiche complète d'un exercice : grande animation, nom puis détails. */
@Component({
  selector: 'app-exercise-guide',
  imports: [ExerciseAnimation, ExerciseDetails],
  template: `
    <app-exercise-animation [images]="exercise().images" [alt]="exercise().name" />
    <h1 class="name">{{ exercise().name }}</h1>
    <p class="equipment">{{ exercise().equipment }}</p>
    <app-exercise-details [exercise]="exercise()" />
  `,
  styles: `
    :host {
      display: block;
    }
    .name {
      margin: 16px 4px 0;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.15;
    }
    .equipment {
      margin: 4px 4px 0;
      color: var(--label-2);
    }
  `,
})
export class ExerciseGuide {
  readonly exercise = input.required<Exercise>();
}
