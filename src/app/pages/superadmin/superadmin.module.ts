import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SuperAdminPageRoutingModule } from './superadmin-routing.module';
import { SuperAdminPage } from './superadmin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SuperAdminPageRoutingModule
  ],
  declarations: [SuperAdminPage]
})
export class SuperAdminPageModule {}
