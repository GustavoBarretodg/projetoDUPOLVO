import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { GAME_CONFIGS, GameConfig } from 'src/app/shared/game-config';

@Component({
  selector: 'app-game-mode',
  templateUrl: './game-mode.page.html',
  styleUrls: ['./game-mode.page.scss'],
})
export class GameModePage implements OnInit {

  game: GameConfig | null = null;
  gameKey: string = 'LOTOFACIL';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.loadGame();
  }

  ionViewWillEnter() {
    this.loadGame();
  }

  loadGame() {
    this.gameKey = this.route.snapshot.queryParams['game'] || 'LOTOFACIL';
    this.game = GAME_CONFIGS[this.gameKey] || GAME_CONFIGS['LOTOFACIL'];
  }

  goBack() {
    this.navCtrl.back();
  }

  goToManual() {
    this.router.navigate(['/tabs/property-detail'], { queryParams: { game: this.gameKey } });
  }

  goToRandom() {
    this.router.navigate(['/tabs/property-random'], { queryParams: { game: this.gameKey } });
  }

  goToUnfolding() {
    this.router.navigate(['/tabs/property-unfolding'], { queryParams: { game: this.gameKey } });
  }
}
