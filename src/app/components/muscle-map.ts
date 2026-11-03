import { Component, computed, input } from '@angular/core';
import { Exercise, MUSCLE_LABELS, MuscleId } from '../models';

interface MuscleShape {
  id: MuscleId;
  /** Moitié gauche du corps (axe de symétrie x = 60) ; la moitié droite est obtenue par miroir. */
  paths: string[];
}

const roundedRect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r},${y}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 -${r},${r}` +
  `h-${w - 2 * r}a${r},${r} 0 0 1 -${r},-${r}v-${h - 2 * r}a${r},${r} 0 0 1 ${r},-${r}Z`;

const FOREARM = 'M24,109 Q18.5,121 18,136 Q20,142 23,140.5 Q28,128 31,113 Q29.5,107 24,109 Z';

const FRONT: MuscleShape[] = [
  { id: 'traps', paths: ['M52,47 Q46,47 40,49.5 Q46,52 53,51 Z'] },
  { id: 'shoulders', paths: ['M36,50 Q27,51 24,61 Q23,71 27,78 Q31,68 39,60 Q41,54 36,50 Z'] },
  { id: 'chest', paths: ['M44,57 Q51,53 59,55 L59,77 Q51,81 44,77 Q39,71 40,64 Q41,59 44,57 Z'] },
  { id: 'biceps', paths: ['M27,81 Q23,91 24.5,102 Q28,108 32,104 Q35,94 34.5,85 Q32,78 27,81 Z'] },
  { id: 'forearms', paths: [FOREARM] },
  {
    id: 'abs',
    paths: [
      roundedRect(50.5, 81, 8.5, 10, 2.5),
      roundedRect(50.5, 93, 8.5, 10, 2.5),
      roundedRect(50.5, 105, 8.5, 9.5, 2.5),
      'M50.5,116.5 L59,116.5 L59,136 Q54,134 51,126 Z',
    ],
  },
  { id: 'obliques', paths: ['M40,81 Q46,83 48.5,86 L48.5,118 Q45,124 42,127 Q37,112 37,97 Q37,87 40,81 Z'] },
  { id: 'hipFlexors', paths: ['M44,130 Q50,134 55.5,143 Q52,147 47,143.5 Q43,137 44,130 Z'] },
  { id: 'quads', paths: ['M40,145 Q47,147 52.5,155 Q58,167 57,185 Q56,200 52,208 Q46,210 42,204 Q36,190 36,172 Q36,155 40,145 Z'] },
  { id: 'calves', paths: ['M49.5,221 Q54.5,231 53,243 Q50.5,248 48.5,244 Q48.5,232 49.5,221 Z'] },
];

const BACK: MuscleShape[] = [
  { id: 'traps', paths: ['M60,38 Q54,42 42,50 Q50,57 55,71 L60,84 Z'] },
  { id: 'shoulders', paths: ['M36,50 Q27,52 24,62 Q24,72 27,78 Q32,68 40,61 Q41,54 36,50 Z'] },
  { id: 'triceps', paths: ['M27,81 Q22.5,93 24.5,104 Q28.5,109 33,103 Q35,93 34,84 Q32,78 27,81 Z'] },
  { id: 'forearms', paths: [FOREARM] },
  { id: 'lats', paths: ['M43,63 Q50,71 55,85 L56,97 Q50,107 45,113 Q39.5,103 38,89 Q38,73 43,63 Z'] },
  { id: 'lowerBack', paths: ['M54.5,102.5 Q57,101.5 59,102 L59,128 Q54.5,128 50.5,124 Q50.5,112 54.5,102.5 Z'] },
  { id: 'glutes', paths: ['M59.5,132 Q50,130 44,136 Q38,146 42,156 Q50,162 59.5,158 Z'] },
  { id: 'hamstrings', paths: ['M41,162 Q48,166 56,164 Q57.5,182 54.5,200 Q50,206 45,204 Q38,192 38,178 Q38,168 41,162 Z'] },
  {
    id: 'calves',
    paths: [
      'M41,215 Q36.5,225 38.5,237 Q42.5,245 46.5,239 Q47.5,227 46.5,215 Q44,211 41,215 Z',
      'M49,215 Q54,223 53,235 Q50.5,241 48.5,237 Q48.5,225 49,215 Z',
    ],
  },
];

/** Tête, cou, mains, genoux, tibias et pieds : la silhouette non musculaire. */
const BODY_FRONT = [
  'M60,4 a12,15 0 1 0 0.01,0 Z',
  'M53,34 Q60,38 67,34 L68,45 Q60,48 52,45 Z',
  'M19.5,142 a4,7 0 1 0 0.01,0 Z',
  'M48,208 a5,4.5 0 1 0 0.01,0 Z',
  'M42,220 Q38.5,232 40.5,246 Q43,250 45.5,246 Q47.5,232 46.5,220 Z',
  'M46,249.5 a6,3.5 0 1 0 0.01,0 Z',
];
const BODY_BACK = [
  'M60,4 a12,15 0 1 0 0.01,0 Z',
  'M53,34 Q60,38 67,34 L68,45 Q60,48 52,45 Z',
  'M19.5,142 a4,7 0 1 0 0.01,0 Z',
  'M47.5,206 a4.5,3 0 1 0 0.01,0 Z',
  'M43,240 Q45,239 47,240 L47,248 L43,248 Z',
  'M46,249.5 a6,3.5 0 1 0 0.01,0 Z',
];

const MIRROR = 'matrix(-1 0 0 1 120 0)';

@Component({
  selector: 'app-muscle-map',
  template: `
    <div class="layout">
    <div class="figures" role="img" [attr.aria-label]="summary()">
      @for (view of views; track view.label) {
        <figure>
          <svg viewBox="0 0 120 258" aria-hidden="true">
            <defs>
              <linearGradient [attr.id]="'mm-primary-' + view.label" x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0" stop-color="#ff2d55" />
                <stop offset="1" stop-color="#ff9500" />
              </linearGradient>
            </defs>
            <g class="body">
              @for (d of view.body; track $index) {
                <path [attr.d]="d" />
                <path [attr.d]="d" [attr.transform]="mirror" />
              }
            </g>
            @for (muscle of view.muscles; track $index) {
              <g
                class="muscle"
                [class.primary]="level(muscle.id) === 'primary'"
                [class.secondary]="level(muscle.id) === 'secondary'"
                [style.fill]="level(muscle.id) === 'primary' ? 'url(#mm-primary-' + view.label + ')' : null"
              >
                @for (d of muscle.paths; track $index) {
                  <path [attr.d]="d" />
                  <path [attr.d]="d" [attr.transform]="mirror" />
                }
              </g>
            }
          </svg>
          <figcaption>{{ view.label }}</figcaption>
        </figure>
      }
    </div>

    <div class="side">
    <div class="chips">
      @for (m of muscles().primary; track m) {
        <span class="chip primary">{{ labels[m] }}</span>
      }
      @for (m of muscles().secondary; track m) {
        <span class="chip secondary">{{ labels[m] }}</span>
      }
    </div>
    <div class="legend">
      <span><i class="dot primary"></i>Principal</span>
      @if (muscles().secondary.length) {
        <span><i class="dot secondary"></i>Secondaire</span>
      }
    </div>
    </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    /* Silhouettes compactes à gauche, noms des muscles à droite */
    .layout {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .figures {
      flex: none;
      display: flex;
      gap: 6px;
    }
    figure {
      width: 68px;
      margin: 0;
      text-align: center;
    }
    .side {
      flex: 1;
      min-width: 0;
    }
    svg {
      display: block;
      width: 100%;
      overflow: visible;
    }
    figcaption {
      margin-top: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--label-3);
    }
    .body {
      fill: var(--body);
    }
    .muscle {
      fill: var(--muscle-idle);
      transition: fill 0.4s ease;
    }
    .muscle.primary {
      filter: drop-shadow(0 0 2px rgb(255 45 85 / 0.55));
      animation: pulse 2.6s ease-in-out infinite;
    }
    .muscle.secondary {
      fill: var(--accent);
      fill-opacity: 0.35;
    }
    @keyframes pulse {
      50% {
        opacity: 0.75;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .muscle.primary {
        animation: none;
      }
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .chip {
      padding: 5px 11px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 999px;
    }
    .chip.primary {
      color: #ffffff;
      background: var(--gradient);
    }
    .chip.secondary {
      color: var(--accent);
      background: var(--accent-soft);
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 12px;
      margin-top: 10px;
      font-size: 12px;
      color: var(--label-2);
    }
    .legend span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot.primary {
      background: var(--gradient);
    }
    .dot.secondary {
      background: var(--accent);
      opacity: 0.35;
    }
  `,
})
export class MuscleMap {
  readonly muscles = input.required<Exercise['muscles']>();

  protected readonly views = [
    { label: 'Face', body: BODY_FRONT, muscles: FRONT },
    { label: 'Dos', body: BODY_BACK, muscles: BACK },
  ];
  protected readonly mirror = MIRROR;
  protected readonly labels = MUSCLE_LABELS;
  protected readonly summary = computed(() => {
    const names = (ids: MuscleId[]) => ids.map((m) => MUSCLE_LABELS[m]).join(', ');
    const secondary = this.muscles().secondary;
    return `Muscles principaux : ${names(this.muscles().primary)}.${secondary.length ? ` Secondaires : ${names(secondary)}.` : ''}`;
  });

  protected level(muscle: MuscleId): 'primary' | 'secondary' | null {
    if (this.muscles().primary.includes(muscle)) return 'primary';
    return this.muscles().secondary.includes(muscle) ? 'secondary' : null;
  }
}
