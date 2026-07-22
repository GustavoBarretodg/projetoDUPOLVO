import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CardPageRoutingModule } from './card-routing.module';

import { CardPage } from './card.page';

import { MiAccordionComponent } from '../../widgets/mi-accordion/mi-accordion.component';
import { SharedComponentsModule } from '../../components/shared-components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CardPageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [CardPage, MiAccordionComponent]
})
export class CardPageModule {}
