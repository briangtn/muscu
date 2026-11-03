import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Icon } from './components/icon';
import { EXERCISE_LIST } from './data/exercises';
import { unlockAudioOnTouch } from './device';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);

  /** La barre d'onglets est masquée pendant une séance pour laisser la place aux commandes. */
  protected readonly showTabs = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => !e.urlAfterRedirects.startsWith('/seance')),
    ),
    { initialValue: !location.pathname.endsWith('/seance') },
  );

  constructor() {
    unlockAudioOnTouch();
    // Une fois le service worker actif, on charge toutes les images pour qu'elles soient disponibles hors ligne à la salle.
    navigator.serviceWorker?.ready.then(() => {
      for (const url of EXERCISE_LIST.flatMap((e) => e.images)) fetch(url, { mode: 'cors' }).catch(() => undefined);
    });
  }
}
