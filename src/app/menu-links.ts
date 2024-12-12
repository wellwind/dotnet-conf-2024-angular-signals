import { Route } from '@angular/router';

export interface MenuLink extends Route {
  title?: string;
}

export type MenuLinks = Array<MenuLink>;

export const menuLinks: MenuLinks = [
  {
    path: 'quick-start-rxjs',
    title: 'Quick Start (RxJS)',
    loadComponent: () => import('./demo/demo-01-quick-start-rxjs.component'),
  },
  {
    path: 'quick-start-signal',
    title: 'Quick Start (Signal)',
    loadComponent: () => import('./demo/demo-01-quick-start-signal.component'),
  },
  {
    path: 'quick-start-signal-new',
    title: 'Quick Start (Signal with v19 New API)',
    loadComponent: () => import('./demo/demo-01-quick-start-signal-new.component'),
  },
  {
    path: 'signal-untracked',
    title: 'untracked',
    loadComponent: () => import('./demo/demo-02-untracked.component'),
  },
  {
    path: 'lazy-signal',
    title: 'Lazy Signal',
    loadComponent: () => import('./demo/demo-03-lazy-signal.component'),
  },
  {
    path: 'output-from-observable',
    title: 'outputFromObservable',
    loadComponent: () => import('./demo/demo-04-output-from-observable.component'),
  },
  {
    path: 'signal-queries',
    title: 'Signal Queries',
    loadComponent: () => import('./demo/demo-05-signal-queries.component'),
  },
  {
    path: '',
    redirectTo: 'quick-start-signal',
    pathMatch: 'full',
  },
];
