import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AdminService } from '../../services/admin.service';
import { BolaoService } from '../../services/bolao.service';
import { StorageService } from '../../services/storage.service';
import { GAME_CONFIGS, GAME_LIST } from 'src/app/shared/game-config';
import { downloadBlob } from 'src/app/shared/download';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  // Apostas
  bets: any[] = [];
  loading = true;
  filter: 'all' | 'pending' | 'marked' = 'all';

  // Navegação de views
  view: 'apostas' | 'bolaos' = 'apostas';

  // Bolões
  adminBolaos: any[] = [];
  bolaoLoading = false;
  newBolao = { name: '', gameType: '', pricePerQuota: null, maxQuotas: null };
  games = GAME_LIST;

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
      case 'pending': return this.bets.filter(b => !b.marked);
      case 'marked':  return this.bets.filter(b => b.marked);
      default:        return this.bets;
    }
  }

  toggleMarked(bet: any) {
    const newMarked = !bet.marked;
    this.adminSvc.updateBetStatus(bet.id, newMarked).subscribe((res) => {
      if (res.message === 'bet_updated') {
        bet.marked = newMarked;
        this.showToast(newMarked ? 'Jogo marcado' : 'Jogo desmarcado');
      } else if (res.message === 'forbidden') {
        this.showToast('Esse jogo não é da sua cidade.');
      } else {
        this.showToast('Erro ao atualizar');
      }
    }, () => {
      this.showToast('Erro ao atualizar');
    });
  }

  downloadBetPdf(bet: any) {
    this.adminSvc.getBetPdf(bet.id).subscribe((blob: Blob) => {
      downloadBlob(blob, `cartao-${bet.id}.pdf`);
    }, () => {
      this.showToast('Erro ao gerar PDF do cartão');
    });
  }

  downloadAllPendingPdf() {
    this.adminSvc.getAllPendingBetsPdf().subscribe((blob: Blob) => {
      downloadBlob(blob, 'jogos-pendentes.pdf');
    }, (err) => {
      if (err.status === 404) {
        this.showToast('Nenhum jogo pendente pra imprimir.');
      } else {
        this.showToast('Erro ao gerar PDF dos jogos pendentes');
      }
    });
  }

  getGameConfig(key: string) {
    return GAME_CONFIGS[key] || { name: key, color: '#2F89C5', icon: 'ticket-outline' };
  }

  getStatusLabel(bet: any): string {
    return bet.marked ? 'Jogo Marcado' : 'Não Marcado';
  }

  getStatusColor(bet: any): string {
    return bet.marked ? '#209869' : '#F78B00';
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
