import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { BetService } from '../../services/bet.service';
import { StorageService } from '../../services/storage.service';
import { GAME_CONFIGS, GameConfig, getBetPrice, formatBRL } from 'src/app/shared/game-config';

@Component({
  selector: 'app-property-unfolding',
  templateUrl: './property-unfolding.page.html',
  styleUrls: ['./property-unfolding.page.scss'],
})
export class PropertyUnfoldingPage implements OnInit {

  gameConfig: GameConfig = GAME_CONFIGS['LOTOFACIL'];
  gameKey: string = 'LOTOFACIL';

  public user = { id: '', name: '', email: '', phone: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private betSvc: BetService,
    private storage: StorageService
  ) {}

  ngOnInit() {
    this.getUser();
    this.loadGame();
  }

  ionViewWillEnter() {
    this.loadGame();
  }

  loadGame() {
    this.gameKey = this.route.snapshot.queryParams['game'] || 'LOTOFACIL';
    this.gameConfig = GAME_CONFIGS[this.gameKey] || GAME_CONFIGS['LOTOFACIL'];
  }

  getUser() {
    this.storage.get('user').then((res) => {
      this.user = res;
    }).catch((_error) => {});
  }

  goBack() {
    this.navCtrl.back();
  }

  async onSave(qtdCard: any) {
    if (!qtdCard.value) {
      this.showToast('Escolha a quantidade de cartões para jogar');
      return;
    }

    const qty = parseInt(qtdCard.value, 10);
    const pricePerCard = getBetPrice(this.gameKey, this.gameConfig.minPick);
    const total = pricePerCard * qty;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar aposta',
      message: `<strong>${qty} cartão(ns)</strong> desdobrados de ${this.gameConfig.name} totalizando <strong>${formatBRL(total)}</strong>.<br><br>Deseja adicionar ao carrinho? O pagamento será confirmado pelo administrador.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Adicionar', handler: () => this.saveUnfoldingBet(qtdCard) }
      ]
    });
    await alert.present();
  }

  private saveUnfoldingBet(qtdCard: any) {
    const params: any = {
      id_bet: 1040,
      id_user: this.user.id,
      qtd_card: qtdCard.value,
      paid: 0,
      game_type: this.gameKey
    };

    this.betSvc.addBetRandom(params).subscribe(() => {
      this.showToast('Cartões adicionados ao carrinho!');
      this.router.navigate(['/tabs/card']);
    }, () => {
      this.showToast('Falha ao gerar cartões');
    });
  }

  showToast(msg: string) {
    this.toastCtrl.create({ message: msg, duration: 2000 }).then(t => t.present());
  }
}
