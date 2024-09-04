import { Routes } from '@angular/router';

export const routes: Routes = [
    {
      path: 'general',
      loadComponent: () =>
        import('./general-table/general-table.component').then(m => m.GeneralTableComponent),
    },
    {
      path: 'summary',
      loadComponent: () =>
        import('./summary-info/summary-info.component').then(m => m.SummaryInfoComponent),
    },
  ];
