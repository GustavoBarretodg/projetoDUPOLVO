import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {

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
