import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { BetService } from '../../services/bet.service';
import { StorageService } from '../../services/storage.service';
import { GAME_CONFIGS, GameConfig } from 'src/app/shared/game-config';

@Component({
  selector: 'app-property-random',
  templateUrl: './property-random.page.html',
  styleUrls: ['./property-random.page.scss'],
})
export class PropertyRandomPage implements OnInit {

  gameConfig: GameConfig = GAME_CONFIGS['LOTOFACIL'];
  gameKey: string = 'LOTOFACIL';

  public user = { id: '', name: '', email: '', phone: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private betSvc: BetService,
    private storage: StorageService
  ) {}

  ngOnInit() {
    this.getUser();
    this.route.queryParams.subscribe(params => {
      this.gameKey = params['game'] || 'LOTOFACIL';
      this.gameConfig = GAME_CONFIGS[this.gameKey] || GAME_CONFIGS['LOTOFACIL'];
    });
  }

  getUser() {
    this.storage.get('user').then((res) => {
      this.user = res;
    }).catch((_error) => {});
  }

  goBack() {
    this.navCtrl.back();
  }

  onSave(qtdCard: any) {
    if (!qtdCard.value) {
      this.showToast('Escolha a quantidade de cartões para jogar');
      return;
    }

    const params: any = {
      id_bet: 1030,
      id_user: this.user.id,
      qtd_card: qtdCard.value,
      paid: 0,
      game_type: this.gameKey
    };

    this.betSvc.addBetRandom(params).subscribe(() => {
      this.showToast('Cartões gerados com sucesso!');
      this.router.navigate(['/tabs/home']);
    }, () => {
      this.showToast('Falha ao gerar cartões');
    });
  }

  showToast(msg: string) {
    this.toastCtrl.create({ message: msg, duration: 2000 }).then(t => t.present());
  }
}
