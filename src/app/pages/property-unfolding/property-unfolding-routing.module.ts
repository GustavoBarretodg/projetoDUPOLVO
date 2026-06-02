import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PropertyUnfoldingPage } from './property-unfolding.page';

const routes: Routes = [
  {
    path: '',
    component: PropertyUnfoldingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PropertyUnfoldingPageRoutingModule {}
