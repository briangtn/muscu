import { Component, input, output } from '@angular/core';
import { Exercise } from '../models';
import { Icon } from './icon';

/** Feuille de choix d'un exercice de remplacement, quand la machine prévue est prise. */
@Component({
  selector: 'app-swap-sheet',
  imports: [Icon],
  template: `
    <div class="backdrop" (click)="closed.emit()"></div>
    <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="swap-title">
      <span class="grabber"></span>
      <header>
        <h2 id="swap-title">Remplacer l'exercice</h2>
        <button class="close" (click)="closed.emit()" aria-label="Fermer"><app-icon name="close" /></button>
      </header>
      <p class="hint">Machine prise ? Choisis un exercice qui travaille les mêmes muscles. Tes charges sont suivies à part pour chacun.</p>
      <div class="list" style="--separator-inset: 80px">
        @for (option of options(); track option.id) {
          <button class="row" [class.selected]="option.id === currentId()" (click)="picked.emit(option.id)">
            <img class="thumb" [src]="option.images[0]" alt="" crossorigin="anonymous" />
            <span class="grow">
              <span class="title">{{ option.name }}</span>
              <span class="subtitle">
                @if (option.id === plannedId()) {
                  <span class="tag">Prévu</span>
                }
                {{ option.equipment }}
              </span>
            </span>
            @if (option.id === currentId()) {
              <app-icon class="current" name="check" />
            }
          </button>
        }
      </div>
    </section>
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    .backdrop {
      position: absolute;
      inset: 0;
      background: rgb(0 0 0 / 0.4);
      animation: fade 0.2s ease-out;
    }
    .sheet {
      position: relative;
      max-height: 85dvh;
      overflow-y: auto;
      padding: 8px 16px calc(env(safe-area-inset-bottom) + 16px);
      background: var(--bg);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      animation: rise 0.25s ease-out;
    }
    .grabber {
      display: block;
      width: 36px;
      height: 5px;
      margin: 0 auto 8px;
      background: var(--fill-strong);
      border-radius: 3px;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
    }
    .close {
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      font-size: 13px;
      color: var(--label-2);
      background: var(--fill);
      border: 0;
      border-radius: 50%;
    }
    .hint {
      margin: 6px 0 14px;
      font-size: 15px;
      color: var(--label-2);
    }
    .row {
      width: 100%;
      font: inherit;
      text-align: left;
      background: none;
      border: 0;
    }
    .row:active {
      background: var(--fill);
    }
    .selected .title {
      font-weight: 600;
    }
    .tag {
      margin-right: 4px;
      padding: 1px 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--accent);
      background: var(--accent-soft);
      border-radius: 6px;
    }
    .current {
      font-size: 18px;
      color: var(--accent);
    }
    @keyframes fade {
      from {
        opacity: 0;
      }
    }
    @keyframes rise {
      from {
        transform: translateY(100%);
      }
    }
  `,
})
export class SwapSheet {
  /** L'exercice prévu puis ses alternatives. */
  readonly options = input.required<Exercise[]>();
  readonly plannedId = input.required<string>();
  readonly currentId = input.required<string>();
  readonly picked = output<string>();
  readonly closed = output<void>();
}
