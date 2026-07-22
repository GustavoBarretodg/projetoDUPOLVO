import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { PageHeaderComponent } from './page-header/page-header.component';
import { DpCardComponent } from './card/card.component';
import { LotteryBallComponent } from './lottery-ball/lottery-ball.component';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [PageHeaderComponent, DpCardComponent, LotteryBallComponent],
  exports: [PageHeaderComponent, DpCardComponent, LotteryBallComponent],
})
export class SharedComponentsModule {}
