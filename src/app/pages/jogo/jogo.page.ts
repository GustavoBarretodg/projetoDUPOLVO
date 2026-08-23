import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CartService } from '../../services/cart.service';
import { ResultadoService, LoteriaResultado } from '../../services/resultado.service';
import { GAME_CONFIGS, GameConfig, getBetPrice, formatBRL } from 'src/app/shared/game-config';

// Dados ilustrativos do concurso, usados ate o resultado real chegar
// (ou como fallback se a API externa estiver fora do ar).
const FICTITIOUS_CONTEST: { [key: string]: { concurso: string; prize: string } } = {
  LOTOFACIL: { concurso: '3187', prize: 'R$ 2 Milhões' },
};

// Mesma lista de quantidades da antiga tela "Aleatorio".
const BULK_QTY_OPTIONS = [1, 5, 10, 15, 20, 30, 33];

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

  public bulkQty = BULK_QTY_OPTIONS[0];
  public bulkOptions = BULK_QTY_OPTIONS;

  public countdown = '';
  private countdownTimer: any = null;

  public cartCount$ = this.cart.count$;

  private drawTarget: Date | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController,
    private cart: CartService,
    private resultadoService: ResultadoService
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

    this.resultadoService.getResultado(gameKey).subscribe({
      next: (r: LoteriaResultado) => this.applyResultado(r),
      error: () => {},
    });
  }

  private applyResultado(r: LoteriaResultado) {
    if (!r || !r.proximoConcurso) return;

    this.concurso = String(r.proximoConcurso);
    this.contestDate = r.dataProximoConcurso || this.contestDate;
    this.prize = (r.valorEstimadoProximoConcurso || 0)
      .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

    const [d, m, y] = (r.dataProximoConcurso || '').split('/').map(Number);
    if (d && m && y) {
      this.drawTarget = new Date(y, m - 1, d, 20, 0, 0, 0);
    }
  }

  ngOnDestroy() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  // Conta ate o proximo sorteio real (20h da data vinda da API); enquanto
  // essa data nao chega, usa um alvo ilustrativo (hoje ou amanha as 20h).
  private startCountdown() {
    const update = () => {
      const now = new Date();
      let target = this.drawTarget;
      if (!target) {
        target = new Date();
        target.setHours(20, 0, 0, 0);
        if (target <= now) target.setDate(target.getDate() + 1);
      }

      const diff = Math.max(0, target.getTime() - now.getTime());
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
    this.selected = this.randomCombo(this.surpresinhaQty);
  }

  private randomCombo(qty: number): number[] {
    const pool = [...this.numberRange];
    const picked: number[] = [];
    while (picked.length < qty && pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(i, 1)[0]);
    }
    return picked.sort((a, b) => a - b);
  }

  // Gera N cartoes aleatorios de uma vez e manda todos pro carrinho -
  // equivalente a tela "Aleatorio" do layout antigo, mas gerado no
  // cliente (o antigo gerava no servidor, o que exigia login).
  generateBulk() {
    const price = getBetPrice(this.gameConfig.key, this.gameConfig.minPick);
    let added = 0;
    let skipped = 0;

    for (let i = 0; i < this.bulkQty; i++) {
      const combo = this.randomCombo(this.gameConfig.minPick);
      if (this.cart.add(this.gameConfig.key, combo, price)) {
        added++;
      } else {
        skipped++;
      }
    }

    if (added === 0) {
      this.showToast('Não foi possível gerar novos cartões (todos já estavam no carrinho).', 2200);
      return;
    }

    let msg = `${added} ${added === 1 ? 'cartão adicionado' : 'cartões adicionados'} ao carrinho!`;
    if (skipped) msg += ` (${skipped} repetido${skipped > 1 ? 's' : ''} ignorado${skipped > 1 ? 's' : ''})`;
    this.showToast(msg, 2500);
  }

  clearSelection() {
    this.selected = [];
  }

  get emptySlots(): number[] {
    const missing = this.gameConfig.maxPick - this.selected.length;
    return missing > 0 ? Array(missing).fill(0) : [];
  }

  isExtraPick(index: number): boolean {
    return index >= this.gameConfig.minPick;
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
    this.router.navigate(['/bolao'], { queryParams: { game: this.gameConfig.key } });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  comingSoon() {
    this.showToast('Em breve!');
  }

  private showToast(msg: string, duration = 1800) {
    this.toastCtrl.create({ message: msg, duration }).then(t => t.present());
  }
}
