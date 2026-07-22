import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-lottery-ball',
  templateUrl: './lottery-ball.component.html',
  styleUrls: ['./lottery-ball.component.scss'],
})
export class LotteryBallComponent {
  @Input() value: number | string;
  @Input() active = false;
}
