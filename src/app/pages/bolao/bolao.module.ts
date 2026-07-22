import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BolaoPageRoutingModule } from './bolao-routing.module';
import { BolaoPage } from './bolao.page';
import { SharedComponentsModule } from '../../components/shared-components.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, BolaoPageRoutingModule, SharedComponentsModule],
  declarations: [BolaoPage]
})
export class BolaoPageModule {}
