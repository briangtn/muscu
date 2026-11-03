import { Component, computed, input } from '@angular/core';

const PATHS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  dumbbell: 'M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11',
  clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7.5V12l3 2',
  timer: 'M12 22a8 8 0 1 0 0-16a8 8 0 1 0 0 16zM12 10v4l2.5 1.5M9.5 2.5h5',
  chevronRight: 'M9 5l7 7-7 7',
  chevronLeft: 'M15 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12.5l4.5 4.5L19 7',
  play: 'M7 4.5v15l12.5-7.5z',
  arrowUp: 'M12 19V5M5.5 11.5 12 5l6.5 6.5',
  info: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 11v5.5M12 7.8v.2',
  warning: 'M12 3.5 2.5 20h19L12 3.5zM12 10v4.5M12 17.3v.2',
  skip: 'M5 6l9 6-9 6V6zM18 6v12',
  half: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 3v18',
  minus: 'M6 12h12',
} as const;

export type IconName = keyof typeof PATHS;

/** Icônes au trait façon SF Symbols ; la taille suit la taille du texte (1em). */
@Component({
  selector: 'app-icon',
  template: `
    <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path [attr.d]="path()" [attr.fill]="name() === 'play' ? 'currentColor' : 'none'" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      width: 1em;
      height: 1em;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  protected readonly path = computed(() => PATHS[this.name()]);
}
