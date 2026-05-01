import { Routes } from '@angular/router';

import { content } from './shared/routes/routes';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    children: content,
  },
];
