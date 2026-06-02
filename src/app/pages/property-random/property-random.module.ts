import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PropertyRandomPageRoutingModule } from './property-random-routing.module';

import { PropertyRandomPage } from './property-random.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PropertyRandomPageRoutingModule
  ],
  declarations: [PropertyRandomPage]
})
export class PropertyRandomPageModule {}
