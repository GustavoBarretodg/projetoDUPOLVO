import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ConfirmedPageRoutingModule } from './confirmed-routing.module';
import { ConfirmedPage } from './confirmed.page';
import { SharedComponentsModule } from '../../components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmedPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [ConfirmedPage]
})
export class ConfirmedPageModule {}
