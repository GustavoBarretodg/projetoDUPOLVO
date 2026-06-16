import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AdminService } from '../../services/admin.service';
import { StorageService } from '../../services/storage.service';
import { GAME_CONFIGS } from 'src/app/shared/game-config';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  bets: any[] = [];
  loading = true;
  filter: 'all' | 'pending' | 'paid' | 'processed' = 'all';

  constructor(
    private adminSvc: AdminService,
    private storage: StorageService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadBets();
  }

  loadBets() {
    this.loading = true;
    this.adminSvc.getAllBets().subscribe((res) => {
      this.bets = res.data || [];
      this.loading = false;
    }, () => {
      this.loading = false;
      this.showToast('Erro ao carregar cartões');
    });
  }

  get filteredBets() {
    switch (this.filter) {
      case 'pending':  return this.bets.filter(b => !b.paid && !b.processed);
      case 'paid':     return this.bets.filter(b => b.paid && !b.processed);
      case 'processed':return this.bets.filter(b => b.processed);
      default:         return this.bets;
    }
  }

  togglePaid(bet: any) {
    const newPaid = !bet.paid;
    this.adminSvc.updateBetStatus(bet.id, newPaid, undefined).subscribe(() => {
      bet.paid = newPaid;
      if (!newPaid) bet.processed = false;
      this.showToast(newPaid ? 'Marcado como pago' : 'Pagamento desmarcado');
    }, () => {
      this.showToast('Erro ao atualizar');
    });
  }

  toggleProcessed(bet: any) {
    const newProcessed = !bet.processed;
    this.adminSvc.updateBetStatus(bet.id, undefined, newProcessed).subscribe(() => {
      bet.processed = newProcessed;
      this.showToast(newProcessed ? 'Marcado como processado' : 'Processamento desmarcado');
    }, () => {
      this.showToast('Erro ao atualizar');
    });
  }

  getGameConfig(key: string) {
    return GAME_CONFIGS[key] || { name: key, color: '#2F89C5', icon: 'ticket-outline' };
  }

  getStatusLabel(bet: any): string {
    if (bet.processed) return 'Processado';
    if (bet.paid) return 'Pago';
    return 'Pendente';
  }

  getStatusColor(bet: any): string {
    if (bet.processed) return '#209869';
    if (bet.paid) return '#2F89C5';
    return '#F78B00';
  }

  async logout() {
    await this.storage.remove('user');
    await this.storage.remove('token');
    this.router.navigate(['/login']);
  }

  showToast(msg: string) {
    this.toastCtrl.create({ message: msg, duration: 2000 }).then(t => t.present());
  }
}
