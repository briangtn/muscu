import { Routes } from '@angular/router';
import { History } from './pages/history/history';
import { Home } from './pages/home/home';
import { ExerciseDetail } from './pages/library/exercise-detail';
import { Library } from './pages/library/library';
import { Workout } from './pages/workout/workout';

export const routes: Routes = [
  { path: '', component: Home, title: 'Muscu' },
  { path: 'seance', component: Workout, title: 'Séance · Muscu' },
  { path: 'historique', component: History, title: 'Historique · Muscu' },
  { path: 'exercices', component: Library, title: 'Exercices · Muscu' },
  { path: 'exercices/:id', component: ExerciseDetail, title: 'Exercice · Muscu' },
  { path: '**', redirectTo: '' },
];
