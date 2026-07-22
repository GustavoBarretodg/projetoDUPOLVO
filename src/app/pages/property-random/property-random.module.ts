import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PropertyRandomPageRoutingModule } from './property-random-routing.module';

import { PropertyRandomPage } from './property-random.page';
import { SharedComponentsModule } from 'src/app/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PropertyRandomPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [PropertyRandomPage]
})
export class PropertyRandomPageModule {}
