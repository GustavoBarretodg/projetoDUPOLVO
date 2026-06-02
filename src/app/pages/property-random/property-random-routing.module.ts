import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PropertyRandomPage } from './property-random.page';

const routes: Routes = [
  {
    path: '',
    component: PropertyRandomPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PropertyRandomPageRoutingModule {}
