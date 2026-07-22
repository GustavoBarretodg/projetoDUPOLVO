import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { BetService } from '../../services/bet.service';
import { StorageService } from '../../services/storage.service';
import { GAME_CONFIGS, getBetPrice, formatBRL } from 'src/app/shared/game-config';

@Component({
  selector: 'app-card',
  templateUrl: './card.page.html',
  styleUrls: ['./card.page.scss'],
})
export class CardPage implements OnInit {

  public user: any = {};
  public cards: any[] = [];
  public totalValue: string = 'R$ 0,00';

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
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
      this.cards = all.filter((b: any) => !b.paid);
      this.calcTotal();
    }, () => {
      this.showToast('Falha ao buscar cartões');
    });
  }

  calcTotal() {
    const total = this.cards.reduce((sum: number, card: any) => {
      return sum + this.getCardRawPrice(card);
    }, 0);
    this.totalValue = formatBRL(total);
  }

  private getCardRawPrice(card: any): number {
    if (card.bolaoId) return card.quotaPrice || 0;
    return getBetPrice(card.gameType, card.bet?.length || 0);
  }

  async finalizeOrder() {
    const alert = await this.alertCtrl.create({
      header: 'Pedido registrado',
      message: `Seu pedido com <strong>${this.cards.length} cartão(ns)</strong> totalizando <strong>${this.totalValue}</strong> foi registrado.<br><br>O pagamento ainda é feito manualmente: aguarde o administrador confirmar para suas apostas aparecerem em "Confirmados".`,
      buttons: ['Entendi']
    });
    await alert.present();
  }

  removeCard(id: number) {
    this.betSvc.removeBet({ id_bet: id }).subscribe(() => {
      this.showToast('Cartão removido!');
      this.getUserBet();
    }, () => {
      this.showToast('Falha ao remover cartão');
    });
  }

  getGameName(gameType: string): string {
    return GAME_CONFIGS[gameType]?.name || gameType || 'Loteria';
  }

  getGameColor(gameType: string): string {
    return GAME_CONFIGS[gameType]?.color || '#2F89C5';
  }

  getCardPrice(card: any): string {
    return formatBRL(this.getCardRawPrice(card));
  }

  showToast(msg: string) {
    this.toastCtrl.create({ message: msg, duration: 2000 }).then((t) => t.present());
  }
}
