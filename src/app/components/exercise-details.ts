import { Component, input } from '@angular/core';
import { Exercise } from '../models';
import { Icon } from './icon';
import { MuscleMap } from './muscle-map';

/** Consignes clés, muscles travaillés et erreurs fréquentes d'un exercice. */
@Component({
  selector: 'app-exercise-details',
  imports: [Icon, MuscleMap],
  template: `
    <p class="list-header">Consignes</p>
    <ol class="list">
      @for (cue of exercise().cues; track cue; let i = $index) {
        <li class="row">
          <span class="num">{{ i + 1 }}</span>
          <span class="grow">{{ cue }}</span>
        </li>
      }
    </ol>

    <p class="list-header">Muscles travaillés</p>
    <div class="card">
      <app-muscle-map [muscles]="exercise().muscles" />
    </div>

    @if (exercise().mistakes.length) {
      <p class="list-header">À éviter</p>
      <ul class="list">
        @for (mistake of exercise().mistakes; track mistake) {
          <li class="row">
            <app-icon class="warn" name="warning" />
            <span class="grow">{{ mistake }}</span>
          </li>
        }
      </ul>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .list {
      --separator-inset: 52px;
    }
    .row {
      align-items: flex-start;
      font-size: 16px;
      line-height: 1.35;
    }
    .num {
      flex: none;
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
      background: var(--accent-soft);
      border-radius: 50%;
    }
    .warn {
      margin-top: 2px;
      font-size: 20px;
      color: var(--orange);
    }
  `,
})
export class ExerciseDetails {
  readonly exercise = input.required<Exercise>();
}
