import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BolaoPage } from './bolao.page';

const routes: Routes = [{ path: '', component: BolaoPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BolaoPageRoutingModule {}
