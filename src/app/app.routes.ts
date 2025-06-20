import type { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { TeacherGuard } from './core/guards/teacher.guard';
import { authRoutes } from './features/auth/auth.routes';
import { adminRoutes } from './features/admin/admin.routes';
import { App } from './app';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: authRoutes,
  },
  {
    path: 'admin',
    children: adminRoutes,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'teacher',
    loadChildren: () =>
      import('./features/teacher/teacher.routes').then((m) => m.teacherRoutes),
    canActivate: [AuthGuard, TeacherGuard],
  },
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
