import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CartService } from '../../services/cart.service';
import { GAME_CONFIGS, GameConfig, getBetPrice, formatBRL } from 'src/app/shared/game-config';

// Dados ilustrativos do concurso ate a integracao com resultados oficiais.
const FICTITIOUS_CONTEST: { [key: string]: { concurso: string; prize: string } } = {
  LOTOFACIL: { concurso: '3187', prize: 'R$ 2 Milhões' },
};

@Component({
  selector: 'app-jogo',
  templateUrl: './jogo.page.html',
  styleUrls: ['./jogo.page.scss'],
})
export class JogoPage implements OnInit, OnDestroy {

  public gameConfig: GameConfig = GAME_CONFIGS['LOTOFACIL'];
  public concurso = '';
  public prize = '';
  public contestDate = '';

  public numberRange: number[] = [];
  public selected: number[] = [];

  public surpresinhaQty = 0;
  public surpresinhaOptions: number[] = [];

  public countdown = '';
  private countdownTimer: any = null;

  public cartCount$ = this.cart.count$;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController,
    private cart: CartService
  ) {}

  ngOnInit() {
    const gameKey = this.route.snapshot.queryParams['game'] || 'LOTOFACIL';

    if (gameKey !== 'LOTOFACIL' || !GAME_CONFIGS[gameKey]) {
      this.toastCtrl.create({ message: 'Em breve! No momento apenas a Lotofácil está disponível.', duration: 2000 }).then(t => t.present());
      this.router.navigate(['/']);
      return;
    }

    this.gameConfig = GAME_CONFIGS[gameKey];
    this.concurso = FICTITIOUS_CONTEST[gameKey]?.concurso || '0000';
    this.prize = FICTITIOUS_CONTEST[gameKey]?.prize || '';
    this.contestDate = new Date().toLocaleDateString('pt-BR');

    this.numberRange = [];
    for (let n = this.gameConfig.min; n <= this.gameConfig.max; n++) {
      this.numberRange.push(n);
    }

    this.surpresinhaOptions = [];
    for (let q = this.gameConfig.minPick; q <= this.gameConfig.maxPick; q++) {
      this.surpresinhaOptions.push(q);
    }
    this.surpresinhaQty = this.gameConfig.minPick;

    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  // Contador ilustrativo ate as 20h de hoje (ou de amanha, se ja passou).
  private startCountdown() {
    const update = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(20, 0, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);

      const diff = target.getTime() - now.getTime();
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      this.countdown = `${String(d).padStart(2, '0')}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
    };
    update();
    this.countdownTimer = setInterval(update, 30000);
  }

  isSelected(n: number): boolean {
    return this.selected.includes(n);
  }

  toggleNumber(n: number) {
    const idx = this.selected.indexOf(n);
    if (idx >= 0) {
      this.selected.splice(idx, 1);
      return;
    }
    if (this.selected.length >= this.gameConfig.maxPick) {
      this.showToast(`Máximo de ${this.gameConfig.maxPick} dezenas.`);
      return;
    }
    this.selected.push(n);
  }

  surpresinha() {
    const pool = [...this.numberRange];
    const picked: number[] = [];
    while (picked.length < this.surpresinhaQty && pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(i, 1)[0]);
    }
    this.selected = picked.sort((a, b) => a - b);
  }

  clearSelection() {
    this.selected = [];
  }

  get emptySlots(): number[] {
    const missing = this.gameConfig.minPick - this.selected.length;
    return missing > 0 ? Array(missing).fill(0) : [];
  }

  get subtotal(): number {
    if (this.selected.length < this.gameConfig.minPick) return 0;
    return getBetPrice(this.gameConfig.key, this.selected.length);
  }

  get subtotalLabel(): string {
    return formatBRL(this.subtotal);
  }

  get canAdd(): boolean {
    return this.selected.length >= this.gameConfig.minPick && this.selected.length <= this.gameConfig.maxPick;
  }

  addToCart() {
    if (!this.canAdd) {
      this.showToast(`Escolha de ${this.gameConfig.minPick} a ${this.gameConfig.maxPick} dezenas.`);
      return;
    }
    const added = this.cart.add(this.gameConfig.key, this.selected, this.subtotal);
    if (!added) {
      this.showToast('Esse jogo já está no seu carrinho.');
      return;
    }
    this.selected = [];
    this.showToast('Aposta adicionada ao carrinho!');
  }

  goToCart() {
    this.router.navigate(['/carrinho']);
  }

  goToPayment() {
    if (!this.cart.items.length && !this.canAdd) {
      this.showToast('Adicione uma aposta primeiro.');
      return;
    }
    if (this.canAdd) this.addToCart();
    this.router.navigate(['/carrinho']);
  }

  goToBoloes() {
    this.router.navigate(['/bolao']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  comingSoon() {
    this.showToast('Em breve!');
  }

  private showToast(msg: string) {
    this.toastCtrl.create({ message: msg, duration: 1800 }).then(t => t.present());
  }
}
