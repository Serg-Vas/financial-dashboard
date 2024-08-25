import { Routes } from '@angular/router';
import { GeneralTableComponent } from './general-table/general-table.component';
import { SummaryInfoComponent } from './summary-info/summary-info.component';

export const routes: Routes = [
    { path: 'general', component: GeneralTableComponent},
    { path: 'summary', component: SummaryInfoComponent},
];
