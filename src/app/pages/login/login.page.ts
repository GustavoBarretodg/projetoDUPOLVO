import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  showForm = false;
  private returnUrl: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private authSvc: AuthService,
    private storage: StorageService
) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || null;
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgot() {
    this.router.navigate(['/forgot']);
  }

  onLogin(email: any, password: any) {
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

        if (res.data && res.data.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.router.navigate(['/']);
        }
      }
      else if(res.message === 'not_found_user') {
        this.showToast('Usuário não encontrado.');
      }
      else if(res.message === 'failed_to_authenticate_user') {
        this.showToast('Falha ao autenticar o usuário, verifique os dados e tente novamente.');
      }
      else if(res.message === 'account_pending') {
        this.showToast('Sua conta está aguardando aprovação do administrador.');
      }

    }, () => {
      this.showToast('Falha ao autenticar o usuário.');
    });
  }

  showToast(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000
    }).then((toastData) => {
      toastData.present();
    });
  }
}
