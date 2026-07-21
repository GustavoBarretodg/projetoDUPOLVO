import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GAME_LIST, GameConfig } from 'src/app/shared/game-config';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  games: GameConfig[] = GAME_LIST;

  constructor(private router: Router) {}

  ngOnInit() {}

  goToCards() {
    this.router.navigate(['/tabs/card']);
  }

  goToBolao() {
    this.router.navigate(['/bolao']);
  }

  goToGame(gameKey: string) {
    this.router.navigate(['/tabs/game-mode'], { queryParams: { game: gameKey } });
  }
}
