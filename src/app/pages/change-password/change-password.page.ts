import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

const MIN_PASSWORD_LENGTH = 6;

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {

  loading = false;
  private email: string | null = null;
  private resetToken: string | null = null;

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private authSvc: AuthService,
    private storage: StorageService
  ) { }

  async ngOnInit() {
    // So chega aqui depois de verificar o OTP em /forgot, que deixa esses
    // dois salvos. Sem eles, nao tem como trocar a senha - volta pro inicio.
    this.email = await this.storage.get('resetEmail').catch(() => null);
    this.resetToken = await this.storage.get('resetToken').catch(() => null);
    if (!this.email || !this.resetToken) {
      this.router.navigate(['/forgot']);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  changePassword(newPasswordInput: any, confirmPasswordInput: any) {
    const newPassword = (newPasswordInput.value || '').toString().trim();
    const confirmPassword = (confirmPasswordInput.value || '').toString().trim();

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      this.showToast(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      this.showToast('As senhas não coincidem.');
      return;
    }
    if (!this.email || !this.resetToken) {
      this.router.navigate(['/forgot']);
      return;
    }

    this.loading = true;
    this.authSvc.resetPassword({ email: this.email, resetToken: this.resetToken, newPassword }).subscribe(async (res) => {
      this.loading = false;
      if (res.message === 'password_updated') {
        await this.storage.removeItem('resetEmail').catch(() => {});
        await this.storage.removeItem('resetToken').catch(() => {});
        this.showToast('Senha alterada com sucesso! Faça login.');
        this.router.navigate(['/login']);
      } else if (res.message === 'invalid_reset_token') {
        this.showToast('Esse código expirou. Peça um novo.');
        this.router.navigate(['/forgot']);
      } else if (res.message === 'password_too_short') {
        this.showToast(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      } else {
        this.showToast('Não foi possível trocar a senha.');
      }
    }, () => {
      this.loading = false;
      this.showToast('Não foi possível trocar a senha.');
    });
  }

  showToast(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 2500
    }).then((toastData) => {
      toastData.present();
    });
  }
}
