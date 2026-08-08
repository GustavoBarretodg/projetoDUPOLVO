import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { GAME_LIST, GameConfig } from 'src/app/shared/game-config';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  games: GameConfig[] = GAME_LIST;

  constructor(private router: Router, private toastCtrl: ToastController) {}

  ngOnInit() {}

  goToCards() {
    this.router.navigate(['/tabs/card']);
  }

  goToBolao() {
    this.router.navigate(['/bolao']);
  }

  goToDashboardPreview() {
    this.router.navigate(['/dashboard']);
  }

  goToGame(gameKey: string) {
    if (gameKey !== 'LOTOFACIL') {
      this.toastCtrl.create({ message: 'Em breve! No momento apenas a Lotofácil está disponível.', duration: 2000 }).then(t => t.present());
      return;
    }
    this.router.navigate(['/tabs/game-mode'], { queryParams: { game: gameKey } });
  }
}
