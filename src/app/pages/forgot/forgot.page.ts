import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

const RESEND_COOLDOWN_SECONDS = 60;

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.scss'],
})
export class ForgotPage implements OnDestroy {

  step: 'email' | 'otp' = 'email';
  email = '';
  loading = false;
  resendCooldown = 0;
  private cooldownInterval: any;

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private authSvc: AuthService,
    private storage: StorageService
  ) { }

  ngOnDestroy() {
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  changeEmail() {
    this.step = 'email';
  }

  sendOtp(emailInput: any) {
    const value = (emailInput.value || '').toString().trim();
    if (!value) {
      this.showToast('Informe seu e-mail.');
      return;
    }
    this.email = value;
    this.requestOtp();
  }

  resendOtp() {
    if (this.resendCooldown > 0) return;
    this.requestOtp();
  }

  private requestOtp() {
    this.loading = true;
    this.authSvc.forgotPassword({ email: this.email }).subscribe(() => {
      this.loading = false;
      this.step = 'otp';
      // A resposta e sempre a mesma exista ou nao o email (pra nao dar pra
      // descobrir quem tem conta), entao a mensagem fica generica tambem.
      this.showToast('Se esse e-mail tiver cadastro, enviamos um código de 6 dígitos.');
      this.startCooldown();
    }, () => {
      this.loading = false;
      this.showToast('Não foi possível enviar o código. Tente novamente.');
    });
  }

  private startCooldown() {
    this.resendCooldown = RESEND_COOLDOWN_SECONDS;
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);
    this.cooldownInterval = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) clearInterval(this.cooldownInterval);
    }, 1000);
  }

  verify(otpInput: any) {
    const otp = (otpInput.value || '').toString().trim();
    if (!otp) {
      this.showToast('Informe o código recebido por e-mail.');
      return;
    }

    this.loading = true;
    this.authSvc.verifyOtp({ email: this.email, otp }).subscribe(async (res) => {
      this.loading = false;
      if (res.message === 'otp_verified') {
        // Guarda so pra atravessar a troca de tela ate a pagina de nova
        // senha - e apagado assim que a senha e trocada (ou se vier invalido).
        await this.storage.set('resetEmail', this.email);
        await this.storage.set('resetToken', res.resetToken);
        this.router.navigate(['/change-password']);
      } else if (res.message === 'otp_expired') {
        this.showToast('O código expirou ou passou do limite de tentativas. Peça um novo.');
      } else {
        this.showToast('Código inválido.');
      }
    }, () => {
      this.loading = false;
      this.showToast('Não foi possível verificar o código.');
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
