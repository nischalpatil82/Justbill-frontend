import { Routes } from '@angular/router';

import { AuthGuard } from '../../core/guard/auth.guard';

export const content: Routes = [
  {
    path: '',
    loadChildren: () => import('../../components/home/home.routes').then(m => m.home),
  },

  // ✅ AUTH ROUTES (ADDED)
 {
  path: 'login',
  loadComponent: () =>
    import('../../components/auth/login/login').then(m => m.Login),
},

{
  path: 'forgot-password',
  loadComponent: () =>
    import('../../components/auth/forgot-password/forgot-password')
      .then(m => m.ForgotPassword),
},

{
  path: 'register',
  loadComponent: () =>
    import('../../components/auth/register/register').then(m => m.Register),
},


  {
    path: 'account',
    loadChildren: () => import('../../components/account/account.routes').then(m => m.account),
    canActivate: [AuthGuard],
  },

  {
    path: '',
    loadChildren: () => import('../../components/blog/blog.routes').then(m => m.blog),
  },
  {
    path: '',
    loadChildren: () => import('../../components/shop/shop.routes').then(m => m.shop),
  },
  {
    path: '',
    loadChildren: () => import('../../components/page/page.routes').then(m => m.page),
  },
  {
    path: '**',
    pathMatch: 'full',
    loadComponent: () =>
      import('../../components/page/error404/error404').then(m => m.Error404),
  },
];