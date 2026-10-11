import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MeusJogosPageRoutingModule } from './meus-jogos-routing.module';

import { MeusJogosPage } from './meus-jogos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeusJogosPageRoutingModule
  ],
  declarations: [MeusJogosPage]
})
export class MeusJogosPageModule {}
