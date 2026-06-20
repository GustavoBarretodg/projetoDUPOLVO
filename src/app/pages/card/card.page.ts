import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { BetService } from '../../services/bet.service';
import { StorageService } from '../../services/storage.service';

const GAME_NAMES: Record<string, string> = {
  LOTOFACIL: 'Lotofácil',
  MEGASENA: 'Mega-Sena',
  QUINA: 'Quina',
  LOTOMANIA: 'Lotomania',
  TIMEMANIA: 'Timemania',
  DUPLASENA: 'Dupla Sena',
  FEDERAL: 'Federal',
  DIADESORTE: 'Dia de Sorte',
};

@Component({
  selector: 'app-card',
  templateUrl: './card.page.html',
  styleUrls: ['./card.page.scss'],
})
export class CardPage implements OnInit {

  public user: any = {};
  public cards: any[] = [];

  constructor(
    private toastCtrl: ToastController,
    private betSvc: BetService,
    private storage: StorageService
  ) {}

  ngOnInit() {
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
      this.cards = res.data || [];
      if (this.cards.length === 0) {
        this.showToast('Você ainda não possui cartões');
      }
    }, () => {
      this.showToast('Falha ao buscar cartões');
    });
  }

  removeCard(id: number) {
    this.betSvc.removeBet({ id_bet: id }).subscribe(() => {
      this.showToast('Cartão removido com sucesso!');
      this.getUserBet();
    }, () => {
      this.showToast('Falha ao remover cartão');
    });
  }

  getGameName(gameType: string): string {
    return GAME_NAMES[gameType] || gameType || 'Loteria';
  }

  showToast(msg: string) {
    this.toastCtrl.create({ message: msg, duration: 2000 })
      .then((t) => t.present());
  }
}
