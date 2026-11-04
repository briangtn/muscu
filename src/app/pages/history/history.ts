import { Component, computed, inject } from '@angular/core';
import { Icon, IconName } from '../../components/icon';
import { findExercise } from '../../data/exercises';
import { plannedStepsOf, PROGRAM } from '../../data/program';
import { formatClock, formatDate, formatKg, formatSpeed, minutesBetween } from '../../format';
import { SetLog, WorkoutLog } from '../../models';
import { EntryStatus, entryStatus, isCountedExercise } from '../../session-report';
import { WorkoutStore } from '../../workout-store';

interface ReportLine {
  name: string;
  status: EntryStatus;
  detail: string;
  bonus: boolean;
}

interface HistoryItem {
  log: WorkoutLog;
  title: string;
  date: string;
  minutes: number;
  doneExercises: number;
  totalExercises: number;
  bonusCount: number;
  lines: ReportLine[];
}

const STATUS_ICONS: Record<EntryStatus, IconName> = {
  done: 'check',
  partial: 'half',
  skipped: 'skip',
  notReached: 'minus',
};

function describeSet(set: SetLog): string {
  if (set.speed != null) return `${formatClock(set.durationSec ?? 0)} à ${formatSpeed(set.speed)}, pente ${set.incline} %`;
  if (set.durationSec !== null) return formatClock(set.durationSec);
  return set.weight !== null ? `${formatKg(set.weight)} × ${set.reps}` : `${set.reps} reps`;
}

function reportLine(log: WorkoutLog, index: number): ReportLine {
  const entry = log.entries[index];
  const status = entryStatus(log, index);
  const done = entry.sets.filter((s) => s.done);
  const sets = done.map(describeSet).join(' · ');
  const detail = {
    done: sets,
    partial: `${done.length}/${entry.sets.length} séries · ${sets}`,
    skipped: 'Passé',
    notReached: 'Non fait, séance arrêtée avant',
  }[status];
  const planned = log.swaps?.[index] ? plannedStepsOf(log)[index] : undefined;
  const replaced = planned ? `À la place de ${findExercise(planned.exerciseId)?.name ?? planned.exerciseId} · ` : '';
  return {
    name: findExercise(entry.exerciseId)?.name ?? entry.exerciseId,
    status,
    detail: replaced + detail,
    bonus: entry.block === 'bonus',
  };
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
          <span class="letter" [class.stopped]="item.log.stoppedAt !== undefined">{{ item.log.templateId }}</span>
          <span class="grow">
            <span class="title">{{ item.title }}</span>
            <span class="date">{{ item.date }}</span>
            <span class="tags">
              <span class="tag">{{ item.minutes }} min</span>
              <span class="tag">{{ item.doneExercises }}/{{ item.totalExercises }} exercices</span>
              @if (item.log.stoppedAt !== undefined) {
                <span class="tag orange">Écourtée</span>
              }
              @if (item.bonusCount) {
                <span class="tag accent">+{{ item.bonusCount }} bonus</span>
              }
            </span>
          </span>
          <app-icon class="chevron" name="chevronRight" />
        </summary>
        <ul>
          @for (line of item.lines; track $index) {
            <li [class]="line.status">
              <span class="status"><app-icon [name]="statusIcons[line.status]" /></span>
              <span class="line-text">
                <span class="exercise">
                  {{ line.name }}
                  @if (line.bonus) {
                    <span class="bonus-label">Bonus</span>
                  }
                </span>
                <span class="detail">{{ line.detail }}</span>
              </span>
            </li>
          }
        </ul>
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
      align-self: flex-start;
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
    .letter.stopped {
      background: linear-gradient(135deg, #ff9500, #ffcc00);
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
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 6px;
    }
    .tag {
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 600;
      color: var(--label-2);
      background: var(--fill);
      border-radius: 999px;
    }
    .tag.orange {
      color: var(--orange);
      background: var(--orange-soft);
    }
    .tag.accent {
      color: var(--accent);
      background: var(--accent-soft);
    }
    .chevron {
      transition: transform 0.2s ease;
    }
    details[open] .chevron {
      transform: rotate(90deg);
    }
    ul {
      margin: 0;
      padding: 0 16px 6px;
      list-style: none;
    }
    li {
      display: flex;
      gap: 10px;
      padding: 9px 0;
      border-top: 0.5px solid var(--separator);
    }
    .status {
      flex: none;
      display: grid;
      place-items: center;
      width: 22px;
      height: 22px;
      margin-top: 1px;
      font-size: 12px;
      border-radius: 50%;
    }
    .done .status {
      color: #ffffff;
      background: var(--green);
    }
    .partial .status {
      color: var(--orange);
      background: var(--orange-soft);
    }
    .skipped .status,
    .notReached .status {
      color: var(--label-2);
      background: var(--fill);
    }
    .line-text {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
    .exercise {
      font-size: 15px;
      font-weight: 500;
    }
    .skipped .exercise,
    .notReached .exercise {
      color: var(--label-2);
    }
    .bonus-label {
      margin-left: 4px;
      padding: 1px 6px;
      font-size: 11px;
      font-weight: 700;
      color: var(--accent);
      background: var(--accent-soft);
      border-radius: 999px;
      vertical-align: 1px;
    }
    .detail {
      font-size: 13px;
      color: var(--label-2);
      font-variant-numeric: tabular-nums;
    }
    .partial .detail {
      color: var(--orange);
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
  protected readonly statusIcons = STATUS_ICONS;

  protected readonly items = computed(() =>
    [...this.store.history()].reverse().map((log): HistoryItem => {
      const counted = log.entries.filter(isCountedExercise);
      return {
        log,
        title: PROGRAM[log.templateId].name,
        date: formatDate(log.finishedAt ?? log.startedAt),
        minutes: log.finishedAt ? minutesBetween(log.startedAt, log.finishedAt) : 0,
        doneExercises: counted.filter((e) => e.sets.some((s) => s.done)).length,
        totalExercises: counted.length,
        bonusCount: log.entries.filter((e) => e.block === 'bonus').length,
        lines: log.entries.map((_, i) => reportLine(log, i)),
      };
    }),
  );
}
