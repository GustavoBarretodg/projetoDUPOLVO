import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperAdminPage } from './superadmin.page';

const routes: Routes = [
  { path: '', component: SuperAdminPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperAdminPageRoutingModule {}
