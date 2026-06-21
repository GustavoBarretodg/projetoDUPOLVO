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

  selectedRole: string = 'USER';

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

  async onRegister(name: any, email: any, phone: any, password: any, city: any) {
    if (!name.value.trim() || !email.value.trim() || !phone.value.trim() || !password.value.trim() || !city.value.trim()) {
      this.showToast('Favor preencher todos os campos!');
      return false;
    }

    let params: any = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      password: password.value.trim(),
      role: this.selectedRole,
      city: city.value.trim()
    };

    this.authSvc.register(params).subscribe((res) => {
      if (res.message === 'email_already_exists') {
        this.showToast('Este e-mail já está cadastrado.');
        return;
      }
      if (res.message === 'city_admin_exists') {
        this.showToast(`Já existe um administrador em ${params.city}.`);
        return;
      }
      if (res.message === 'city_required') {
        this.showToast('Informe a cidade.');
        return;
      }
      this.showToast('Usuário criado com sucesso!');
      this.router.navigate(['/login']);
    }, () => {
      this.showToast('Falha ao criar Usuário. Tente novamente.');
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
