import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {

  @Input() showBack = true;
  @Input() showLogo = true;
  @Input() title?: string;
  @Input() panelColor?: string;

  @Output() back = new EventEmitter<void>();
}
