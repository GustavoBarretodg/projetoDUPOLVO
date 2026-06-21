import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmedPage } from './confirmed.page';

const routes: Routes = [
  { path: '', component: ConfirmedPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfirmedPageRoutingModule {}
