import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { Icon } from './icon';

/** Anime un exercice en alternant ses positions de départ et d'arrivée. */
@Component({
  selector: 'app-exercise-animation',
  imports: [Icon],
  host: { '[class.fill]': 'fill()' },
  template: `
    @if (images().length) {
      <div class="frames">
        @if (fill()) {
          <!-- Fond flouté pour combler les bords quand le cadre n'a pas le ratio de la photo -->
          <img class="backdrop" [src]="images()[0]" alt="" crossorigin="anonymous" />
        }
        @for (src of images(); track src; let i = $index) {
          <img [src]="src" [alt]="alt() + ', position ' + (i + 1)" crossorigin="anonymous" [class.visible]="i === frame()" />
        }
        <div class="dots">
          @for (src of images(); track src; let i = $index) {
            <span [class.on]="i === frame()"></span>
          }
        </div>
      </div>
    } @else {
      <div class="frames placeholder">
        <app-icon name="dumbbell" />
        <span>Pas d'animation pour cet exercice</span>
      </div>
    }
  `,
  styles: `
    .frames {
      position: relative;
      aspect-ratio: 3 / 2;
      background: #ffffff;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      overflow: hidden;
    }
    img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      opacity: 0;
      transition: opacity 0.45s ease;
    }
    img.visible {
      opacity: 1;
    }
    .dots {
      position: absolute;
      bottom: 10px;
      left: 50%;
      display: flex;
      gap: 6px;
      padding: 5px 8px;
      background: rgb(0 0 0 / 0.35);
      border-radius: 999px;
      transform: translateX(-50%);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .dots span {
      width: 6px;
      height: 6px;
      background: rgb(255 255 255 / 0.5);
      border-radius: 50%;
      transition: background 0.3s ease;
    }
    .dots span.on {
      background: #ffffff;
    }
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--label-2);
      background: var(--card);
    }
    .placeholder app-icon {
      font-size: 40px;
      color: var(--label-3);
    }
    /* Remplit le conteneur parent au lieu de garder un ratio fixe */
    :host(.fill) .frames {
      position: absolute;
      inset: 0;
      aspect-ratio: auto;
    }
    img.backdrop {
      inset: -24px;
      width: calc(100% + 48px);
      height: calc(100% + 48px);
      object-fit: cover;
      opacity: 1;
      filter: blur(22px) saturate(1.3) brightness(0.9);
    }
  `,
})
export class ExerciseAnimation {
  readonly images = input.required<string[]>();
  readonly alt = input('');
  readonly fill = input(false);
  protected readonly frame = signal(0);

  constructor() {
    const id = setInterval(() => this.frame.update((f) => (f + 1) % Math.max(1, this.images().length)), 1200);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }
}
