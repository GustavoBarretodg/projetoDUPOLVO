import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { BetService } from '../../services/bet.service';
import { GAME_CONFIGS, getBetPrice, formatBRL } from 'src/app/shared/game-config';

type ResultFilter = 'conferidos' | 'pendentes';

@Component({
  selector: 'app-meus-jogos',
  templateUrl: './meus-jogos.page.html',
  styleUrls: ['./meus-jogos.page.scss'],
})
export class MeusJogosPage implements OnInit {

  public user: any = {};
  public bets: any[] = [];
  public loading = true;
  public filter: ResultFilter = 'pendentes';

  constructor(
    private router: Router,
    private storage: StorageService,
    private betSvc: BetService,
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
      this.loadBets();
    }).catch(() => {});
  }

  private loadBets() {
    if (!this.user?.id) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.betSvc.getBet({ id_user: this.user.id }).subscribe((res) => {
      this.bets = (res.data || []).sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  setFilter(f: ResultFilter) {
    this.filter = f;
  }

  get filteredBets(): any[] {
    return this.bets.filter(b => this.matchesFilter(b));
  }

  private matchesFilter(bet: any): boolean {
    return this.filter === 'conferidos' ? bet.resultStatus === 'AVAILABLE' : bet.resultStatus !== 'AVAILABLE';
  }

  get conferidosCount(): number {
    return this.bets.filter(b => b.resultStatus === 'AVAILABLE').length;
  }

  get pendentesCount(): number {
    return this.bets.filter(b => b.resultStatus !== 'AVAILABLE').length;
  }

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

  goHome() {
    this.router.navigate(['/']);
  }

  goToGame() {
    this.router.navigate(['/jogar'], { queryParams: { game: 'LOTOFACIL' } });
  }
}
