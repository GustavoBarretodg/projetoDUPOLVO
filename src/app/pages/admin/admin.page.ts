import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AdminService } from '../../services/admin.service';
import { BolaoService } from '../../services/bolao.service';
import { StorageService } from '../../services/storage.service';
import { GAME_CONFIGS } from 'src/app/shared/game-config';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  // Apostas
  bets: any[] = [];
  loading = true;
  filter: 'all' | 'pending' | 'paid' | 'processed' = 'all';

  // Navegação de views
  view: 'apostas' | 'bolaos' = 'apostas';

  // Bolões
  adminBolaos: any[] = [];
  bolaoLoading = false;
  newBolao = { name: '', gameType: '', pricePerQuota: null, maxQuotas: null };

  constructor(
    private adminSvc: AdminService,
    private bolaoSvc: BolaoService,
    private storage: StorageService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadBets();
  }

  // ---- APOSTAS ----

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
      case 'pending':   return this.bets.filter(b => !b.paid && !b.processed);
      case 'paid':      return this.bets.filter(b => b.paid && !b.processed);
      case 'processed': return this.bets.filter(b => b.processed);
      default:          return this.bets;
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

  // ---- BOLÕES ----

  switchToBolao() {
    this.view = 'bolaos';
    this.loadAdminBolaos();
  }

  loadAdminBolaos() {
    this.bolaoLoading = true;
    this.bolaoSvc.getAdminBolaos().subscribe((res) => {
      this.adminBolaos = res.data || [];
      this.bolaoLoading = false;
    }, () => {
      this.bolaoLoading = false;
      this.showToast('Erro ao carregar bolões');
    });
  }

  createBolao() {
    const { name, gameType, pricePerQuota, maxQuotas } = this.newBolao;
    if (!name || !gameType || !pricePerQuota || !maxQuotas) {
      this.showToast('Preencha todos os campos do bolão.');
      return;
    }
    this.bolaoSvc.createBolao({ name, gameType, pricePerQuota, maxQuotas }).subscribe((res) => {
      if (res.message === 'bolao_created') {
        this.showToast('Bolão criado com sucesso!');
        this.newBolao = { name: '', gameType: '', pricePerQuota: null, maxQuotas: null };
        this.loadAdminBolaos();
      }
    }, () => {
      this.showToast('Erro ao criar bolão.');
    });
  }

  confirmParticipant(participant: any) {
    this.bolaoSvc.confirmParticipant(participant.id).subscribe((res) => {
      if (res.message === 'confirmed') {
        participant.status = 'CONFIRMED';
        this.showToast('Pagamento confirmado!');
      }
    }, () => {
      this.showToast('Erro ao confirmar pagamento.');
    });
  }

  closeBolao(bolao: any) {
    this.bolaoSvc.closeBolao(bolao.id).subscribe((res) => {
      if (res.message === 'bolao_closed') {
        bolao.status = 'CLOSED';
        this.showToast('Bolão encerrado.');
      }
    }, () => {
      this.showToast('Erro ao encerrar bolão.');
    });
  }

  // ---- GERAL ----

  async logout() {
    await this.storage.removeItem('user');
    await this.storage.removeItem('token');
    this.router.navigate(['/login']);
  }

  showToast(msg: string) {
    this.toastCtrl.create({ message: msg, duration: 2000 }).then(t => t.present());
  }
}
