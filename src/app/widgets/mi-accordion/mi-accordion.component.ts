import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-accordion',
  templateUrl: './mi-accordion.component.html',
  styleUrls: ['./mi-accordion.component.scss']
})
export class MiAccordionComponent implements OnInit {


  /**
   * The id of the technology that will be displayed as the title for the accordion header
   * @public
   * @property id
   * @type {string}
   */
  @Input()
  id : string;

  /**
   * The id of the technology that will be displayed as the title for the accordion header
   * @public
   * @property id_bet
   * @type {string}
   */
  @Input()
  id_bet : string;

  /**
   * The numbers of the technology that will be displayed within the accordion body (when activated 
   * by the user)
   * @public
   * @property description
   * @type {string}
   */
  @Input()
  numbers : string;

  /**
   * The status of the technology that will be displayed within the accordion body (when activated 
   * by the user)
   * @public
   * @property description
   * @type {string}
   */
  @Input()
  status : string;

  /**
   * The change event that will be broadcast to the parent component when the user interacts with the component's 
   * <ion-button> element
   * @public
   * @property change
   * @type {EventEmitter}
   */
  @Output()
  change : EventEmitter<string> = new EventEmitter<string>();


  /**
   * Determines and stores the accordion state (I.e. opened or closed)
   * @public
   * @property isMenuOpen
   * @type {boolean}
   */
  public isMenuOpen : boolean = false;



  constructor() { }



  ngOnInit() {
  }



  /**
   * Allows the accordion state to be toggled (I.e. opened/closed)
   * @public
   * @method toggleAccordion
   * @returns {none}
   */
  public toggleAccordion() : void
  {
      this.isMenuOpen = !this.isMenuOpen;
  }


  /**
   * Allows the value for the <ion-button> element to be broadcast to the parent component
   * @public
   * @method broadcastId
   * @returns {none}
   */
  public broadcastId(id : string) : void
  {
     this.change.emit(id);
  }

}