import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'dashboard' },
	{ path: 'sign-in', loadComponent: () => import('./features/auth/sign-in.component').then((module) => module.SignInComponent) },
	{ path: 'register', loadComponent: () => import('./features/auth/register.component').then((module) => module.RegisterComponent) },
	{
		path: 'forbidden',
		loadComponent: () => import('./features/system/system-page.component').then((module) => module.SystemPageComponent),
		data: { code: '403 · ACCESS DENIED', title: 'This area is not available.', message: 'Your account does not have permission to complete that request.' },
	},
	{
		path: 'not-found',
		loadComponent: () => import('./features/system/system-page.component').then((module) => module.SystemPageComponent),
		data: { code: '404 · NOT FOUND', title: 'We could not find that page.', message: 'Check the address or return to your overview.' },
	},
	{
		path: '',
		component: AppShellComponent,
		canActivate: [authGuard],
		children: [
			{ path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then((module) => module.DashboardComponent) },
			{ path: 'explore', loadComponent: () => import('./features/explore/explore.component').then((module) => module.ExploreComponent) },
			{ path: 'profile', loadComponent: () => import('./features/profile/profile.component').then((module) => module.ProfileComponent) },
			{ path: 'reservations/current', loadComponent: () => import('./features/reservations/reservation-detail.component').then((module) => module.ReservationDetailComponent) },
		],
	},
	{
		path: '**',
		loadComponent: () => import('./features/system/system-page.component').then((module) => module.SystemPageComponent),
		data: { code: '404 · NOT FOUND', title: 'We could not find that page.', message: 'Check the address or return to your overview.' },
	},
];
