import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { BolaoService } from '../../services/bolao.service';
import { CartService } from '../../services/cart.service';
import { GAME_CONFIGS, GameConfig } from 'src/app/shared/game-config';
import { FAKE_BOLOES } from 'src/app/shared/bolao-mock';

const FEATURED_BOLOES_COUNT = 3;

// Premios ilustrativos ate a integracao com o resultado oficial da loteria.
const FICTITIOUS_PRIZES: { [key: string]: string } = {
  LOTOFACIL: '2 Milhões',
  MEGA_SENA: '3,5 Milhões',
  QUINA: '3 Milhões',
  DIA_DE_SORTE: '800 Mil',
  TIMEMANIA: '7,5 Milhões',
  DUPLA_SENA: '1,1 Milhão',
  LOTOMANIA: '10,5 Milhões',
  MILIONARIA: '82 Milhões',
};

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  public user: any = {};

  public specialHighlight = {
    badge: 'Edição especial',
    name: 'Lotofácil Turbo',
    prize: 'R$ 50 Milhões',
  };

  public hojeGames: (GameConfig & { prize: string })[] = ['LOTOFACIL', 'MEGA_SENA', 'QUINA', 'DIA_DE_SORTE']
    .map(key => ({ ...GAME_CONFIGS[key], prize: FICTITIOUS_PRIZES[key] }));

  public amanhaGames: (GameConfig & { prize: string })[] = ['TIMEMANIA', 'DUPLA_SENA', 'LOTOMANIA', 'MILIONARIA']
    .map(key => ({ ...GAME_CONFIGS[key], prize: FICTITIOUS_PRIZES[key] }));

  public featuredBolaos: any[] = FAKE_BOLOES.slice(0, FEATURED_BOLOES_COUNT);
  public showingFakeBolaos = true;

  get isLoggedIn(): boolean {
    return !!(this.user && this.user.id);
  }

  constructor(
    private router: Router,
    private storage: StorageService,
    private toastCtrl: ToastController,
    private bolaoSvc: BolaoService,
    private cart: CartService
  ) {}

  get cartCount$() {
    return this.cart.count$;
  }

  goToCart() {
    this.router.navigate(['/carrinho']);
  }

  ngOnInit() {
    this.getUser();
    this.loadFeaturedBolaos();
  }

  loadFeaturedBolaos() {
    this.bolaoSvc.getAllOpen().subscribe((res) => {
      const real = res.data || [];
      if (real.length) {
        this.featuredBolaos = real.slice(0, FEATURED_BOLOES_COUNT);
        this.showingFakeBolaos = false;
      }
    }, () => {});
  }

  getGameColor(key: string): string {
    return GAME_CONFIGS[key]?.color || '#2F89C5';
  }

  getGameName(key: string): string {
    return GAME_CONFIGS[key]?.name || key;
  }

  ionViewWillEnter() {
    this.getUser();
  }

  getUser() {
    this.storage.get('user').then((res) => {
      this.user = res || {};
    }).catch((_error) => {});
  }

  goToProfile() {
    this.router.navigate(['/conta']);
  }

  goToMarkLotofacil() {
    this.router.navigate(['/jogar'], { queryParams: { game: 'LOTOFACIL' } });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToBolaoList() {
    this.router.navigate(['/bolao']);
  }

  comingSoon() {
    this.toastCtrl.create({ message: 'Em breve!', duration: 1500 }).then(t => t.present());
  }

  goToGame(gameKey: string) {
    if (gameKey !== 'LOTOFACIL') {
      this.toastCtrl.create({ message: 'Em breve! No momento apenas a Lotofácil está disponível.', duration: 2000 }).then(t => t.present());
      return;
    }
    this.goToMarkLotofacil();
  }
}
