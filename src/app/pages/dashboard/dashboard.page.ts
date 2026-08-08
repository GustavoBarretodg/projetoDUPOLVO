import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BetService } from '../../services/bet.service';
import { StorageService } from '../../services/storage.service';
import { GAME_CONFIGS, getBetPrice, formatBRL } from 'src/app/shared/game-config';

const MAX_RECENT_ITEMS = 10;

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

  constructor(
    private router: Router,
    private betSvc: BetService,
    private storage: StorageService
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
