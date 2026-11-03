import { Component, input, output } from '@angular/core';

/** Champ numérique avec boutons − / + pour ajuster vite une valeur entre deux séries. */
@Component({
  selector: 'app-stepper',
  host: { '[class.disabled]': 'disabled()' },
  template: `
    <button type="button" (click)="bump(-1)" [disabled]="disabled()" [attr.aria-label]="'Moins ' + unit()">−</button>
    <label>
      <input
        type="number"
        inputmode="decimal"
        min="0"
        [step]="step()"
        [value]="value() ?? ''"
        [disabled]="disabled()"
        placeholder="–"
        (change)="onInput($event)"
      />
      <span>{{ unit() }}</span>
    </label>
    <button type="button" (click)="bump(1)" [disabled]="disabled()" [attr.aria-label]="'Plus ' + unit()">+</button>
  `,
  styles: `
    :host {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: stretch;
      height: 50px;
      background: var(--fill);
      border-radius: 12px;
      transition: opacity 0.2s ease;
    }
    :host(.disabled) {
      opacity: 0.55;
    }
    button {
      flex: none;
      width: 32px;
      padding: 0;
      font-size: 24px;
      font-weight: 400;
      line-height: 1;
      color: var(--accent);
      background: none;
      border: 0;
    }
    button:disabled {
      color: var(--label-3);
    }
    label {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    input {
      width: 100%;
      padding: 0;
      font: inherit;
      font-size: 20px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      text-align: center;
      color: var(--label);
      background: none;
      border: 0;
      outline: none;
    }
    input:disabled {
      color: var(--label);
      -webkit-text-fill-color: var(--label);
    }
    span {
      margin-top: 1px;
      font-size: 11px;
      white-space: nowrap;
      color: var(--label-2);
    }
  `,
})
export class Stepper {
  readonly value = input<number | null>(null);
  readonly step = input(1);
  readonly unit = input('');
  readonly disabled = input(false);
  readonly valueChange = output<number | null>();

  protected bump(direction: 1 | -1): void {
    const next = (this.value() ?? 0) + direction * this.step();
    this.valueChange.emit(Math.max(0, Math.round(next * 100) / 100));
  }

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.replace(',', '.');
    this.valueChange.emit(raw === '' ? null : Math.max(0, Number(raw)));
  }
}
