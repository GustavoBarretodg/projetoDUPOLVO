import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {

  btnText = 'Editar Perfil';
  isDisabled = true;
  constructor() { }

  ngOnInit() {
  }

  save() {
    if (this.btnText === 'Editar Perfil') {
      this.btnText = 'Salvar Perfil';
      this.isDisabled = false;
    } else {
      this.isDisabled = true;
      this.btnText = 'Editar Perfil';
    }
  }

}
