import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { JogoPageRoutingModule } from './jogo-routing.module';

import { JogoPage } from './jogo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JogoPageRoutingModule
  ],
  declarations: [JogoPage]
})
export class JogoPageModule {}
