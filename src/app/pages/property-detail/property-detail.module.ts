import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PropertyDetailPageRoutingModule } from './property-detail-routing.module';

import { PropertyDetailPage } from './property-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PropertyDetailPageRoutingModule
  ],
  declarations: [PropertyDetailPage]
})
export class PropertyDetailPageModule {}
