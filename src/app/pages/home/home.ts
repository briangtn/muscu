import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../components/icon';
import { exercise } from '../../data/exercises';
import { PROGRAM } from '../../data/program';
import { describeStep, formatDuration, formatKg, formatSpeed } from '../../format';
import { BLOCK_LABELS, BlockId, SessionTemplate, Step } from '../../models';
import { WorkoutStore } from '../../workout-store';

interface BlockSummary {
  label: string;
  lines: { id: string; name: string; image?: string; spec: string; progressed?: boolean }[];
}

const WEEKLY_GOAL = 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * 26;
const TODAY_FORMAT = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly store = inject(WorkoutStore);
  private readonly router = inject(Router);

  protected readonly today = TODAY_FORMAT.format(new Date());
  protected readonly weeklyGoal = WEEKLY_GOAL;
  protected readonly next = this.store.nextTemplate;
  protected readonly currentTemplate = computed(() => {
    const current = this.store.current();
    return current ? PROGRAM[current.templateId] : null;
  });
  protected readonly currentProgress = computed(() => {
    const template = this.currentTemplate();
    return template ? (this.store.current()!.cursor / template.steps.length) * 100 : 0;
  });
  protected readonly strengthCount = computed(() => this.next().steps.filter((s) => s.block === 'strength').length);
  protected readonly blocks = computed(() => this.summarize(this.next()));
  protected readonly thisWeek = computed(() => {
    const monday = startOfWeek(new Date()).getTime();
    return this.store.history().filter((log) => new Date(log.finishedAt ?? log.startedAt).getTime() >= monday).length;
  });
  protected readonly ringCircumference = RING_CIRCUMFERENCE;
  protected readonly ringOffset = computed(
    () => RING_CIRCUMFERENCE * (1 - Math.min(1, this.thisWeek() / WEEKLY_GOAL)),
  );

  protected start(): void {
    this.store.start(this.next().id);
    this.router.navigate(['/seance']);
  }

  protected abandon(): void {
    if (confirm('Abandonner la séance en cours ? Elle ne sera pas enregistrée.')) this.store.abandon();
  }

  /** Déroulé de la séance avec les charges, reps et réglages du tapis prévus. */
  private summarize(template: SessionTemplate): BlockSummary[] {
    const byBlock = new Map<BlockId, Step[]>();
    for (const step of template.steps) byBlock.set(step.block, [...(byBlock.get(step.block) ?? []), step]);
    return [...byBlock].map(([block, steps]) => ({
      label: BLOCK_LABELS[block],
      lines: steps.map((step) => {
        const ex = exercise(step.exerciseId);
        const s = this.store.suggest(step);
        const line = { id: ex.id, name: ex.name, image: ex.images[0] };
        if (ex.tracksSpeed) {
          return { ...line, spec: `${formatDuration(step.durationSec ?? 0)} · ${formatSpeed(s.speed)} · pente ${s.incline} %` };
        }
        if (ex.kind === 'weighted') {
          const load = s.weight !== null ? formatKg(s.weight) : 'charge à définir';
          return { ...line, spec: `${step.sets} × ${s.reps} · ${load}`, progressed: s.progressed };
        }
        return { ...line, spec: describeStep(step, ex) };
      }),
    }));
  }
}
