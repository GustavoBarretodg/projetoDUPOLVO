import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { BetService } from '../../services/bet.service';
import { GAME_CONFIGS, getBetPrice, formatBRL } from 'src/app/shared/game-config';

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  ready: boolean;
}

const MENU: MenuItem[] = [
  { key: 'compras',     label: 'Minhas compras', icon: 'cart-outline',            ready: true },
  { key: 'extrato',     label: 'Extrato',        icon: 'document-text-outline',   ready: false },
  { key: 'dados',       label: 'Meus dados',     icon: 'person-outline',          ready: true },
  { key: 'cartoes',     label: 'Meus cartões',   icon: 'card-outline',            ready: false },
  { key: 'resgates',    label: 'Resgates',       icon: 'cash-outline',            ready: false },
  { key: 'indicacoes',  label: 'Indicações',     icon: 'people-outline',          ready: false },
  { key: 'premiacoes',  label: 'Premiações',     icon: 'trophy-outline',          ready: false },
  { key: 'cashback',    label: 'Cashback',       icon: 'refresh-circle-outline',  ready: false },
  { key: 'assinaturas', label: 'Assinaturas',    icon: 'ribbon-outline',          ready: false },
];

@Component({
  selector: 'app-conta',
  templateUrl: './conta.page.html',
  styleUrls: ['./conta.page.scss'],
})
export class ContaPage implements OnInit {

  public user: any = {};
  public walletBalance = 'R$ 0,00'; // placeholder ate a carteira ser implementada

  public menu = MENU;
  public activeSection = 'compras';

  public bets: any[] = [];
  public loadingBets = true;

  public editingData = false;
  public editName = '';
  public editPhone = '';

  constructor(
    private router: Router,
    private storage: StorageService,
    private betSvc: BetService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadUser();
  }

  ionViewWillEnter() {
    this.loadUser();
  }

  private loadUser() {
    this.storage.get('user').then((res) => {
      this.user = res || {};
      this.editName = this.user.name || '';
      this.editPhone = this.user.phone || '';
      this.loadBets();
    }).catch(() => {});
  }

  private loadBets() {
    if (!this.user?.id) return;
    this.loadingBets = true;
    this.betSvc.getBet({ id_user: this.user.id }).subscribe((res) => {
      this.bets = (res.data || []).sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
      this.loadingBets = false;
    }, () => {
      this.loadingBets = false;
    });
  }

  setSection(item: MenuItem) {
    this.activeSection = item.key;
    if (item.key === 'compras') this.loadBets();
  }

  activeLabel(): string {
    return this.menu.find(m => m.key === this.activeSection)?.label || '';
  }

  isReady(key: string): boolean {
    return this.menu.find(m => m.key === key)?.ready || false;
  }

  // ==== Minhas compras ====

  getGameName(key: string): string {
    return GAME_CONFIGS[key]?.name || key || 'Loteria';
  }

  getGameColor(key: string): string {
    return GAME_CONFIGS[key]?.color || '#2F89C5';
  }

  getBetPriceLabel(bet: any): string {
    if (bet.bolaoId) return formatBRL(bet.quotaPrice || 0);
    return formatBRL(getBetPrice(bet.gameType, bet.bet?.length || 0));
  }

  async removeBet(bet: any) {
    const alert = await this.alertCtrl.create({
      header: 'Remover aposta',
      message: 'Deseja remover esta aposta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Remover',
          handler: () => {
            this.betSvc.removeBet({ id_bet: bet.id }).subscribe(() => {
              this.bets = this.bets.filter(b => b.id !== bet.id);
              this.showToast('Aposta removida.');
            }, () => {
              this.showToast('Erro ao remover. Tente novamente.');
            });
          }
        }
      ]
    });
    alert.present();
  }

  goToGame() {
    this.router.navigate(['/jogar'], { queryParams: { game: 'LOTOFACIL' } });
  }

  // ==== Meus dados ====

  toggleEditData() {
    if (!this.editingData) {
      this.editingData = true;
      return;
    }

    if (!this.editName.trim() || !this.editPhone.trim()) {
      this.showToast('Preencha nome e telefone.');
      return;
    }

    this.user = { ...this.user, name: this.editName.trim(), phone: this.editPhone.trim() };
    this.storage.set('user', this.user);
    this.editingData = false;
    this.showToast('Dados salvos!');
  }

  // ==== Sair ====

  async logout() {
    await this.storage.removeItem('user').catch(() => {});
    await this.storage.removeItem('token').catch(() => {});
    this.router.navigate(['/']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  comingSoon() {
    this.showToast('Em breve!');
  }

  private showToast(msg: string) {
    this.toastCtrl.create({ message: msg, duration: 1800 }).then(t => t.present());
  }
}
