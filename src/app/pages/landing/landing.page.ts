import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { CartService } from '../../services/cart.service';
import { GAME_CONFIGS, GameConfig } from 'src/app/shared/game-config';

interface ResultRow {
  loteria: string;
  data: string;
  premio: string;
}

// Resultados ilustrativos ate a integracao com a API oficial.
const RESULT_ROWS: ResultRow[] = [
  { loteria: 'Lotofácil', data: '10/08/2026', premio: 'R$ 1.800.000' },
  { loteria: 'Mega-Sena', data: '08/08/2026', premio: 'R$ 45.000.000' },
  { loteria: 'Quina', data: '11/08/2026', premio: 'R$ 2.400.000' },
  { loteria: '+Milionária', data: '09/08/2026', premio: 'R$ 68.000.000' },
];

interface Testimonial {
  text: string;
  name: string;
}

// Depoimentos ilustrativos - reais a coletar apos o lancamento.
const TESTIMONIALS: Testimonial[] = [
  { text: 'Achei que ia ser complicado, mas em menos de cinco minutos já tinha feito minha primeira aposta pelo celular.', name: 'Renata A.' },
  { text: 'Ganhei um prêmio pequeno na Quina e o valor caiu na minha conta certinho, sem enrolação.', name: 'Carlos M.' },
  { text: 'Tive uma dúvida sobre um bolão e o suporte respondeu rapidinho, direto com uma pessoa de verdade.', name: 'Juliana P.' },
];

interface NewsItem {
  category: string;
  title: string;
  summary: string;
  date: string;
}

// Noticias ilustrativas - conteudo real a produzir na etapa de blog/SEO.
const NEWS_ITEMS: NewsItem[] = [
  { category: 'Dicas', title: 'Como montar um bolão equilibrado', summary: 'Veja como dividir cotas e escolher números pra aumentar suas chances sem gastar mais.', date: '05/08/2026' },
  { category: 'Resultados', title: 'Mega-Sena acumula e prêmio passa dos R$ 40 milhões', summary: 'Ninguém acertou as seis dezenas do concurso anterior — próximo sorteio promete.', date: '08/08/2026' },
  { category: 'Curiosidades', title: 'Os números mais sorteados nos últimos 12 meses', summary: 'Levantamento mostra quais dezenas mais saíram nos concursos recentes.', date: '11/08/2026' },
];

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  { question: 'Como funciona a Dupolvo?', answer: 'Escolha sua loteria, selecione seus números ou entre em um bolão, finalize a compra e acompanhe o resultado direto na plataforma.' },
  { question: 'Como sei se fui premiado?', answer: 'Você recebe uma notificação por e-mail (e/ou push) assim que o resultado sai, com todas as instruções para resgatar seu prêmio.' },
  { question: 'O que é o bolão da Dupolvo?', answer: 'É um grupo de apostas organizado matematicamente para aumentar as chances de premiação, dividido em cotas que você pode comprar.' },
];

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

  public resultRows = RESULT_ROWS;
  public testimonials = TESTIMONIALS;
  public newsItems = NEWS_ITEMS;
  public newsletterEmail = '';
  public currentYear = new Date().getFullYear();

  public faqItems = FAQ_ITEMS;
  public faqOpenIndex: number | null = null;

  get isLoggedIn(): boolean {
    return !!(this.user && this.user.id);
  }

  constructor(
    private router: Router,
    private storage: StorageService,
    private toastCtrl: ToastController,
    private cart: CartService
  ) {}

  get cartCount$() {
    return this.cart.count$;
  }

  goToCart() {
    this.router.navigate(['/carrinho']);
  }

  ngOnInit() {
    this.storage.get('user').then((res) => {
      this.user = res || {};
    }).catch(() => {});
  }

  getGameColor(key: string): string {
    return GAME_CONFIGS[key]?.color || '#2F89C5';
  }

  getGameName(key: string): string {
    return GAME_CONFIGS[key]?.name || key;
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
    this.router.navigate(['/conta']);
  }

  goToBolaoList() {
    this.router.navigate(['/bolao']);
  }

  goToBoloesForGame(gameKey: string) {
    this.router.navigate(['/bolao'], { queryParams: { game: gameKey } });
  }

  goToMarkLotofacil() {
    this.router.navigate(['/jogar'], { queryParams: { game: 'LOTOFACIL' } });
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

  toggleFaq(index: number) {
    this.faqOpenIndex = this.faqOpenIndex === index ? null : index;
  }

  submitNewsletter() {
    if (!this.newsletterEmail.trim()) {
      this.toastCtrl.create({ message: 'Informe um e-mail válido.', duration: 1500 }).then(t => t.present());
      return;
    }
    this.newsletterEmail = '';
    this.toastCtrl.create({ message: 'Obrigado! Você vai receber nossas novidades em breve.', duration: 2000 }).then(t => t.present());
  }
}
