import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PropertyDetailPage } from './property-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PropertyDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PropertyDetailPageRoutingModule {}
