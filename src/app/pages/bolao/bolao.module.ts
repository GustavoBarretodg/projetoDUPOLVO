import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BolaoPageRoutingModule } from './bolao-routing.module';
import { BolaoPage } from './bolao.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, BolaoPageRoutingModule],
  declarations: [BolaoPage]
})
export class BolaoPageModule {}
