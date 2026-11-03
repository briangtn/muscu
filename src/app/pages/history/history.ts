import { Component, computed, inject } from '@angular/core';
import { Icon } from '../../components/icon';
import { findExercise } from '../../data/exercises';
import { PROGRAM } from '../../data/program';
import { formatClock, formatDate, formatKg, formatSpeed, minutesBetween } from '../../format';
import { SetLog, WorkoutLog } from '../../models';
import { WorkoutStore } from '../../workout-store';

interface HistoryItem {
  log: WorkoutLog;
  title: string;
  date: string;
  minutes: number;
  setCount: number;
  lines: { name: string; sets: string }[];
}

function describeSet(set: SetLog): string {
  if (set.speed != null) return `${formatClock(set.durationSec ?? 0)} à ${formatSpeed(set.speed)}, pente ${set.incline} %`;
  if (set.durationSec !== null) return formatClock(set.durationSec);
  return set.weight !== null ? `${formatKg(set.weight)} × ${set.reps}` : `${set.reps}`;
}

@Component({
  selector: 'app-history',
  imports: [Icon],
  template: `
    <header class="page-header">
      <h1 class="large-title">Historique</h1>
    </header>
    @for (item of items(); track item.log.id) {
      <details class="session">
        <summary>
          <span class="letter">{{ item.log.templateId }}</span>
          <span class="grow">
            <span class="title">{{ item.title }}</span>
            <span class="date">{{ item.date }}</span>
          </span>
          <span class="meta">
            <span>{{ item.minutes }} min</span>
            <span>{{ item.setCount }} séries</span>
          </span>
          <app-icon class="chevron" name="chevronRight" />
        </summary>
        @if (item.lines.length) {
          <ul>
            @for (line of item.lines; track $index) {
              <li>
                <span class="exercise">{{ line.name }}</span>
                <span class="sets">{{ line.sets }}</span>
              </li>
            }
          </ul>
        } @else {
          <p class="empty">Aucune série validée.</p>
        }
      </details>
    } @empty {
      <div class="empty-state">
        <app-icon name="clock" />
        <p class="title">Pas encore de séance</p>
        <p class="muted small">Tes séances terminées apparaîtront ici.</p>
      </div>
    }
  `,
  styles: `
    .session {
      margin-bottom: 10px;
      background: var(--card);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow: hidden;
    }
    summary {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      list-style: none;
      cursor: pointer;
    }
    summary::-webkit-details-marker {
      display: none;
    }
    .letter {
      flex: none;
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      font-size: 18px;
      font-weight: 800;
      color: #ffffff;
      background: var(--gradient);
      border-radius: 11px;
    }
    .grow {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .title {
      font-weight: 600;
    }
    .date {
      font-size: 15px;
      color: var(--label-2);
    }
    .date::first-letter {
      text-transform: uppercase;
    }
    .meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 13px;
      color: var(--label-2);
    }
    .chevron {
      transition: transform 0.2s ease;
    }
    details[open] .chevron {
      transform: rotate(90deg);
    }
    ul {
      margin: 0;
      padding: 0 16px 6px 68px;
      list-style: none;
    }
    li {
      display: flex;
      flex-direction: column;
      padding: 9px 0;
      border-top: 0.5px solid var(--separator);
    }
    .exercise {
      font-size: 15px;
      font-weight: 500;
    }
    .sets {
      font-size: 13px;
      color: var(--label-2);
      font-variant-numeric: tabular-nums;
    }
    .empty {
      margin: 0;
      padding: 0 16px 14px 68px;
      font-size: 15px;
      color: var(--label-2);
    }
    .empty-state {
      padding: 60px 20px;
      text-align: center;
    }
    .empty-state app-icon {
      font-size: 48px;
      color: var(--label-3);
    }
    .empty-state p {
      margin: 6px 0 0;
    }
    .empty-state .title {
      margin-top: 12px;
      font-size: 20px;
    }
  `,
})
export class History {
  private readonly store = inject(WorkoutStore);

  protected readonly items = computed(() =>
    [...this.store.history()].reverse().map((log): HistoryItem => {
      const done = log.entries
        .map((entry) => ({
          name: findExercise(entry.exerciseId)?.name ?? entry.exerciseId,
          sets: entry.sets.filter((s) => s.done),
        }))
        .filter((line) => line.sets.length > 0);
      return {
        log,
        title: PROGRAM[log.templateId].name,
        date: formatDate(log.finishedAt ?? log.startedAt),
        minutes: log.finishedAt ? minutesBetween(log.startedAt, log.finishedAt) : 0,
        setCount: done.reduce((n, line) => n + line.sets.length, 0),
        lines: done.map((line) => ({ name: line.name, sets: line.sets.map(describeSet).join(' · ') })),
      };
    }),
  );
}
