import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { BetService } from '../../services/bet.service';
import { StorageService } from '../../services/storage.service';
import { GAME_CONFIGS, GameConfig, getBetPrice, formatBRL } from 'src/app/shared/game-config';

const MAX_RECENT_ITEMS = 10;

// Premios ilustrativos ate a integracao com o resultado oficial da loteria.
const FICTITIOUS_PRIZES: { [key: string]: string } = {
  LOTOFACIL: '2 Milhões',
  MEGA_SENA: '3,5 Milhões',
  QUINA: '3 Milhões',
  DIA_DE_SORTE: '800 Mil',
  TIMEMANIA: '7,5 Milhões',
  DUPLA_SENA: '1,1 Milhão',
  LOTOMANIA: '10,5 Milhões',
  MILIONARIA: '82 Milhões',
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  public user: any = {};
  public walletBalance: string = 'R$ 0,00'; // placeholder ate a carteira ser implementada
  public activityGroups: { dateLabel: string; items: any[] }[] = [];
  public loading = true;
  public lotofacilColor = GAME_CONFIGS['LOTOFACIL']?.color || '#930089';

  public specialHighlight = {
    badge: 'Edição especial',
    name: 'Lotofácil Turbo',
    prize: 'R$ 50 Milhões',
  };

  public hojeGames: (GameConfig & { prize: string })[] = ['LOTOFACIL', 'MEGA_SENA', 'QUINA', 'DIA_DE_SORTE']
    .map(key => ({ ...GAME_CONFIGS[key], prize: FICTITIOUS_PRIZES[key] }));

  public amanhaGames: (GameConfig & { prize: string })[] = ['TIMEMANIA', 'DUPLA_SENA', 'LOTOMANIA', 'MILIONARIA']
    .map(key => ({ ...GAME_CONFIGS[key], prize: FICTITIOUS_PRIZES[key] }));

  get isLoggedIn(): boolean {
    return !!(this.user && this.user.id);
  }

  constructor(
    private router: Router,
    private betSvc: BetService,
    private storage: StorageService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.getUser();
  }

  ionViewWillEnter() {
    this.getUser();
  }

  getUser() {
    this.storage.get('user').then((res) => {
      this.user = res || {};
      this.loadRecentActivity();
    }).catch((_error) => {});
  }

  loadRecentActivity() {
    if (!this.user?.id) return;

    this.loading = true;
    this.betSvc.getBet({ id_user: this.user.id }).subscribe((res) => {
      const all = res.data || [];
      const marked = all
        .filter((b: any) => b.marked && b.markedAt)
        .sort((a: any, b: any) => new Date(b.markedAt).getTime() - new Date(a.markedAt).getTime())
        .slice(0, MAX_RECENT_ITEMS);

      this.activityGroups = this.groupByDate(marked);
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  private groupByDate(bets: any[]): { dateLabel: string; items: any[] }[] {
    const groups: { dateLabel: string; items: any[] }[] = [];

    for (const bet of bets) {
      const dateLabel = new Date(bet.markedAt).toLocaleDateString('pt-BR');
      let group = groups.find(g => g.dateLabel === dateLabel);
      if (!group) {
        group = { dateLabel, items: [] };
        groups.push(group);
      }
      group.items.push(bet);
    }

    return groups;
  }

  goToProfile() {
    this.router.navigate(['/tabs/profile']);
  }

  goToMarkLotofacil() {
    this.router.navigate(['/tabs/game-mode'], { queryParams: { game: 'LOTOFACIL' } });
  }

  goToMyCards() {
    this.router.navigate(['/tabs/card']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToBolaoList() {
    this.router.navigate(['/bolao']);
  }

  scrollToLoterias() {
    document.getElementById('loterias')?.scrollIntoView({ behavior: 'smooth' });
  }

  comingSoon() {
    this.toastCtrl.create({ message: 'Em breve!', duration: 1500 }).then(t => t.present());
  }

  goToGame(gameKey: string) {
    if (gameKey !== 'LOTOFACIL') {
      this.toastCtrl.create({ message: 'Em breve! No momento apenas a Lotofácil está disponível.', duration: 2000 }).then(t => t.present());
      return;
    }
    this.goToMarkLotofacil();
  }

  getGameName(gameType: string): string {
    return GAME_CONFIGS[gameType]?.name || gameType || 'Loteria';
  }

  getGameColor(gameType: string): string {
    return GAME_CONFIGS[gameType]?.color || '#2F89C5';
  }

  getBetPrice(bet: any): string {
    if (bet.bolaoId) return formatBRL(bet.quotaPrice || 0);
    return formatBRL(getBetPrice(bet.gameType, bet.bet?.length || 0));
  }
}
