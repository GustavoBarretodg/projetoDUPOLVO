import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  btnText = 'Editar Perfil';
  isDisabled = true;
  public user = {
    id: '',
    name:  '',
    email: '',
    phone: ''
  };

  constructor(
    private toastCtrl: ToastController,
    private storage: StorageService
  ) { 

  }

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    this.storage.get('user').then((res) => { 
        this.user = res;
        //console.log('user =', this.user);
    }) 
    .catch((error) => { 
        console.log(error); 
    }); 
  }

  onUpdate(name, phone) {
    if(!name.value.trim() || !phone.value.trim()) {
      this.showToast('Favor informar o nome e telefone!');
      return false;
    }

    if (this.btnText === 'Editar Perfil') {
      this.btnText = 'Salvar Perfil';
      this.isDisabled = false;
    } else {
      console.log('update', name.value.trim(), phone.value.trim());
      this.showToast('Dados salvos com sucesso!');
      this.isDisabled = true;
      this.btnText = 'Editar Perfil';
    }
  }

  showToast(msg) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000
    }).then((toastData) => {
      toastData.present();
    });
  }

}
