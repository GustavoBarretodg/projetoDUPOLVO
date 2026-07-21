import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { BetService } from '../../services/bet.service';
import { StorageService } from '../../services/storage.service';
import { GAME_CONFIGS, GameConfig, getBetPrice, formatBRL } from 'src/app/shared/game-config';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.page.html',
  styleUrls: ['./property-detail.page.scss'],
})
export class PropertyDetailPage implements OnInit {
  counter: number = 0;
  numbers: number[] = [];
  numberRange: number[] = [];
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
    this.numberRange = Array.from(
      { length: this.gameConfig.max - this.gameConfig.min + 1 },
      (_, i) => i + this.gameConfig.min
    );
    this.numbers = [];
    this.counter = 0;
  }

  getUser() {
    this.storage.get('user').then((res) => {
      this.user = res;
    }).catch((_error) => {});
  }

  goBack() {
    this.navCtrl.back();
  }

  async onSave() {
    if (this.numbers.length < this.gameConfig.minPick || this.numbers.length > this.gameConfig.maxPick) {
      const msg = this.gameConfig.minPick === this.gameConfig.maxPick
        ? `Escolha exatamente ${this.gameConfig.minPick} números`
        : `Escolha entre ${this.gameConfig.minPick} e ${this.gameConfig.maxPick} números`;
      this.showToast(msg);
      return;
    }

    const price = getBetPrice(this.gameKey, this.numbers.length);
    const alert = await this.alertCtrl.create({
      header: 'Confirmar aposta',
      message: `<strong>${this.gameConfig.name}</strong> com ${this.numbers.length} dezenas custa <strong>${formatBRL(price)}</strong>.<br><br>Deseja adicionar ao carrinho? O pagamento será confirmado pelo administrador.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Adicionar', handler: () => this.saveBet() }
      ]
    });
    await alert.present();
  }

  private saveBet() {
    const params: any = {
      id_bet: 1020,
      id_user: this.user.id,
      bet: this.numbers.sort((a: number, b: number) => a - b),
      paid: 0,
      game_type: this.gameKey
    };

    this.betSvc.addBet(params).subscribe((res) => {
      if (res.message === 'bet_exists') {
        this.showToast('Esse cartão já existe, escolha outros números!');
        return;
      }
      this.showToast('Cartão adicionado ao carrinho!');
      this.router.navigate(['/tabs/card']);
    }, () => {
      this.showToast('Falha ao criar cartão');
    });
  }

  highlightItem(event: any, index: number) {
    if (!event.target.classList.contains('highlighted')) {
      if (this.counter < this.gameConfig.maxPick) {
        event.target.classList.add('highlighted');
        this.counter++;
        this.numbers.push(index);
        this.checkQty();
      }
    } else {
      event.target.classList.remove('highlighted');
      this.counter--;
      this.numbers = this.numbers.filter(n => n !== index);
      this.checkQty();
    }
  }

  checkQty() {
    if (this.counter === this.gameConfig.maxPick) {
      this.showToast(`Você já escolheu ${this.gameConfig.maxPick} números`);
    }
  }

  showToast(msg: string) {
    this.toastCtrl.create({ message: msg, duration: 2000 }).then(t => t.present());
  }
}
