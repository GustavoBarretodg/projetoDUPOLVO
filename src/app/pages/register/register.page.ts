import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private authSvc: AuthService
) { }

  ngOnInit() {
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  async onRegister(name, email, phone, password) {
    if(!name.value.trim() || !email.value.trim() || !phone.value.trim() || !password.value.trim()) {
      this.showToast('Favor preencher todos os campos!');
      return false;
    }

    let params: any = {
      name: name.value.trim(), 
      email: email.value.trim(), 
      phone: phone.value.trim(), 
      password: password.value.trim()
    };

    this.authSvc.register(params).subscribe((res) => {
      //console.log('res=', res);
      this.showToast('Usuário criado com sucesso!');
      this.router.navigate(['/login']);
    }, (error) => {
      this.showToast('Falha ao criar Usuário');
    });
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
