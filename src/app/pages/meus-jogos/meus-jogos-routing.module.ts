import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeusJogosPage } from './meus-jogos.page';

const routes: Routes = [
  {
    path: '',
    component: MeusJogosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeusJogosPageRoutingModule {}
