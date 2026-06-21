import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { BetService } from '../../services/bet.service';
import { StorageService } from '../../services/storage.service';
import { GAME_CONFIGS, getBetPrice, formatBRL } from 'src/app/shared/game-config';

@Component({
  selector: 'app-confirmed',
  templateUrl: './confirmed.page.html',
  styleUrls: ['./confirmed.page.scss'],
})
export class ConfirmedPage implements OnInit {

  public user: any = {};
  public cards: any[] = [];
  public totalValue: string = 'R$ 0,00';

  constructor(
    private toastCtrl: ToastController,
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
      this.user = res;
      this.getUserBet();
    }).catch((err) => console.log(err));
  }

  getUserBet() {
    if (!this.user?.id) return;

    this.betSvc.getBet({ id_user: this.user.id }).subscribe((res) => {
      const all = res.data || [];
      this.cards = all.filter((b: any) => b.paid);
      this.calcTotal();
    }, () => {
      this.showToast('Falha ao buscar cartões');
    });
  }

  calcTotal() {
    const total = this.cards.reduce((sum: number, card: any) => {
      return sum + getBetPrice(card.gameType, card.bet?.length || 0);
    }, 0);
    this.totalValue = formatBRL(total);
  }

  getGameName(gameType: string): string {
    return GAME_CONFIGS[gameType]?.name || gameType || 'Loteria';
  }

  getGameColor(gameType: string): string {
    return GAME_CONFIGS[gameType]?.color || '#209869';
  }

  getCardPrice(card: any): string {
    const price = getBetPrice(card.gameType, card.bet?.length || 0);
    return formatBRL(price);
  }

  showToast(msg: string) {
    this.toastCtrl.create({ message: msg, duration: 2000 }).then((t) => t.present());
  }
}
