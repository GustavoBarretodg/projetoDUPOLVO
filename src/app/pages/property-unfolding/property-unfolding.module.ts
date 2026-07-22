import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PropertyUnfoldingPageRoutingModule } from './property-unfolding-routing.module';

import { PropertyUnfoldingPage } from './property-unfolding.page';
import { SharedComponentsModule } from 'src/app/components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PropertyUnfoldingPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [PropertyUnfoldingPage]
})
export class PropertyUnfoldingPageModule {}
