import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PropertyDetailPageRoutingModule } from './property-detail-routing.module';

import { PropertyDetailPage } from './property-detail.page';
import { SharedComponentsModule } from 'src/app/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PropertyDetailPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [PropertyDetailPage]
})
export class PropertyDetailPageModule {}
