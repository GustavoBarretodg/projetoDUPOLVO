import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { GAME_CONFIGS, GameConfig } from 'src/app/shared/game-config';

interface TickerItem {
  name: string;
  prize: string;
  when: string;
}

interface FeaturedLottery extends GameConfig {
  concurso: string;
  prize: string;
  sorteio: string;
}

// Ticker de topo: marcas ficticias do copy da landing, diferentes dos
// jogos reais da Caixa usados no resto do app.
const TICKER_ITEMS: TickerItem[] = [
  { name: 'Mega Polvo', prize: 'R$ 4,2 Milhões', when: 'Hoje' },
  { name: 'Sorte Fácil', prize: 'R$ 6,8 Milhões', when: 'Hoje' },
  { name: 'Polvo da Sorte', prize: 'R$ 1,3 Milhão', when: 'Amanhã' },
  { name: 'Quina Real', prize: 'R$ 2,9 Milhões', when: 'Hoje' },
];

// Concurso/premio/sorteio ilustrativos ate a integracao com resultados oficiais.
const FEATURED_LOTTERIES_DATA: { [key: string]: { concurso: string; prize: string; sorteio: string } } = {
  LOTOFACIL:    { concurso: 'nº 3.187', prize: 'R$ 2 Milhões',    sorteio: 'Hoje' },
  MEGA_SENA:    { concurso: 'nº 2.754', prize: 'R$ 3,5 Milhões',  sorteio: 'Quarta-feira' },
  QUINA:        { concurso: 'nº 6.421', prize: 'R$ 3 Milhões',    sorteio: 'Hoje' },
  DIA_DE_SORTE: { concurso: 'nº 918',   prize: 'R$ 800 Mil',      sorteio: 'Amanhã' },
  TIMEMANIA:    { concurso: 'nº 2.190', prize: 'R$ 7,5 Milhões',  sorteio: 'Amanhã' },
  DUPLA_SENA:   { concurso: 'nº 2.688', prize: 'R$ 1,1 Milhão',   sorteio: 'Hoje' },
  LOTOMANIA:    { concurso: 'nº 2.735', prize: 'R$ 10,5 Milhões', sorteio: 'Sexta-feira' },
  MILIONARIA:   { concurso: 'nº 215',   prize: 'R$ 82 Milhões',   sorteio: 'Sábado' },
};

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  public user: any = {};
  public mobileMenuOpen = false;
  public loteriasOpen = false;

  public tickerItems = TICKER_ITEMS;

  public featuredLotteries: FeaturedLottery[] = Object.keys(FEATURED_LOTTERIES_DATA).map(key => ({
    ...GAME_CONFIGS[key],
    ...FEATURED_LOTTERIES_DATA[key],
  }));

  get isLoggedIn(): boolean {
    return !!(this.user && this.user.id);
  }

  constructor(
    private router: Router,
    private storage: StorageService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.storage.get('user').then((res) => {
      this.user = res || {};
    }).catch(() => {});
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (!this.mobileMenuOpen) this.loteriasOpen = false;
  }

  toggleLoterias() {
    this.loteriasOpen = !this.loteriasOpen;
  }

  scrollTo(id: string) {
    this.mobileMenuOpen = false;
    this.loteriasOpen = false;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToProfile() {
    this.router.navigate(['/tabs/profile']);
  }

  goToBolaoList() {
    this.router.navigate(['/bolao']);
  }

  goToMarkLotofacil() {
    this.router.navigate(['/tabs/game-mode'], { queryParams: { game: 'LOTOFACIL' } });
  }

  goToGame(gameKey: string) {
    if (gameKey !== 'LOTOFACIL') {
      this.comingSoon();
      return;
    }
    this.goToMarkLotofacil();
  }

  comingSoon() {
    this.toastCtrl.create({ message: 'Em breve!', duration: 1500 }).then(t => t.present());
  }
}
