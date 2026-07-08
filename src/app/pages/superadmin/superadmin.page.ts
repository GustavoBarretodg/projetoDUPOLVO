import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SuperAdminService } from '../../services/superadmin.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-superadmin',
  templateUrl: './superadmin.page.html',
  styleUrls: ['./superadmin.page.scss'],
})
export class SuperAdminPage implements OnInit {

  pendingAdmins: any[] = [];
  loading = true;

  constructor(
    private superAdminSvc: SuperAdminService,
    private storage: StorageService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.loading = true;
    this.superAdminSvc.getPendingAdmins().subscribe((res) => {
      this.pendingAdmins = res.data || [];
      this.loading = false;
    }, () => {
      this.showToast('Erro ao carregar pendentes');
      this.loading = false;
    });
  }

  async approveAdmin(admin: any) {
    const alert = await this.alertCtrl.create({
      header: 'Aprovar administrador',
      message: `Aprovar <strong>${admin.name}</strong> como administrador de <strong>${admin.city}</strong>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aprovar',
          handler: () => {
            this.superAdminSvc.approveAdmin(admin.id, true).subscribe(() => {
              this.showToast(`${admin.name} aprovado com sucesso!`);
              this.loadPending();
            }, () => this.showToast('Erro ao aprovar'));
          }
        }
      ]
    });
    await alert.present();
  }

  async rejectAdmin(admin: any) {
    const alert = await this.alertCtrl.create({
      header: 'Rejeitar administrador',
      message: `Rejeitar o cadastro de <strong>${admin.name}</strong> (${admin.city})?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Rejeitar',
          cssClass: 'danger',
          handler: () => {
            this.superAdminSvc.approveAdmin(admin.id, false).subscribe(() => {
              this.showToast(`${admin.name} rejeitado.`);
              this.loadPending();
            }, () => this.showToast('Erro ao rejeitar'));
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmReset() {
    const alert = await this.alertCtrl.create({
      header: 'Resetar banco de dados',
      message: 'Isso irá <strong>apagar todos os usuários e apostas</strong> (exceto sua conta). Tem certeza?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Apagar tudo',
          cssClass: 'danger',
          handler: () => {
            this.superAdminSvc.resetUsers().subscribe((res) => {
              this.showToast(`${res.deleted_users} usuários removidos.`);
              this.loadPending();
            }, () => this.showToast('Erro ao resetar'));
          }
        }
      ]
    });
    await alert.present();
  }

  async logout() {
    await this.storage.removeItem('user');
    await this.storage.removeItem('token');
    this.router.navigate(['/login']);
  }

  showToast(msg: string) {
    this.toastCtrl.create({ message: msg, duration: 2500 }).then(t => t.present());
  }
}
