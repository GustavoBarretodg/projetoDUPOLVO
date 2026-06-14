import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private authSvc: AuthService,
    private storage: StorageService
) { }

  ngOnInit() {
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgot() {
    this.router.navigate(['/forgot']);
  }

  onLogin(email, password) {
    if(!email.value.trim() || !password.value.trim()) {
      this.showToast('Favor informar login e senha!');
      return false;
    }

    let params: any = {
      email: email.value.trim(), 
      password: password.value.trim()
    };

    this.authSvc.login(params).subscribe((res) => {
      if(res.message === 'authenticated_user') {
        this.storage.set('user', res.data);
        this.storage.set('token', res.token);

        this.showToast('Usuário autenticado com sucesso');

        this.router.navigate(['/tabs/home']);
      } 
      else if(res.message === 'not_found_user') {
        this.showToast('Usuário não encontrado.');
      }
      else if(res.message === 'failed_to_authenticate_user') {
        this.showToast('Falha ao autenticar o usuário, verifique os dados e tente novamente.');
      }

    }, (error) => {
      this.showToast('Falha ao autenticar o usuário.');
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
