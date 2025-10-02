import {Routes} from '@angular/router';
import {RoleGuard} from './shared/guard/role-guard.guard';
import {VerifyEmailComponent} from './component/verify-email/verify-email.component';
import {MessageComponent} from './component/message/message.component';
import {ResetPasswordComponent} from './component/reset-password/reset-password.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./component/login/login.component').then(
        (m) => m.LoginComponent
      ),
    data: { title: 'Login Page' },
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/default-layout/default-layout.component').then(
        (m) => m.DefaultLayoutComponent
      ),
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./views/dashboard/routes').then((m) => m.routes),
        canActivate: [RoleGuard],
        data: { allowedRoles: ['ROLE_USER', 'admin'] },
      },

      {
        path: 'user',
        loadChildren: () => import('./user/routes').then((m) => m.routes),
        canActivate: [RoleGuard],
        data: { allowedRoles: ['ROLE_USER', 'admin'] },
      },
    ],
  },

  {path: 'verify-email/:token', component: VerifyEmailComponent},
  {path: 'reset-password/:token', component: ResetPasswordComponent},
  {path: 'message', component: MessageComponent},
  { path: '**', redirectTo: 'login' },
];
