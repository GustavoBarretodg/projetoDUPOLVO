import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GameModePageRoutingModule } from './game-mode-routing.module';
import { GameModePage } from './game-mode.page';
import { SharedComponentsModule } from 'src/app/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GameModePageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [GameModePage]
})
export class GameModePageModule {}
