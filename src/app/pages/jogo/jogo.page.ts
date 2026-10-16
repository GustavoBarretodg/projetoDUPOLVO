import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CartService } from '../../services/cart.service';
import { BetService } from '../../services/bet.service';
import { StorageService } from '../../services/storage.service';
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

  // Evita clique duplo enquanto consulta o servidor por dezenas repetidas.
  public checking = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private cart: CartService,
    private betSvc: BetService,
    private storage: StorageService,
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

  // Pergunta ao servidor se outro jogador ja marcou essas dezenas. So da
  // pra checar logado (endpoint autenticado); sem login, ou se a consulta
  // falhar, devolve null e a checagem fica pro pagamento.
  private async checkDuplicates(combos: number[][]): Promise<boolean[] | null> {
    const user = await this.storage.get('user').catch(() => null);
    if (!user || !user.id) return null;
    try {
      const res = await this.betSvc.checkBets(this.gameConfig.key, combos).toPromise();
      return res && Array.isArray(res.duplicates) ? res.duplicates : null;
    } catch {
      return null;
    }
  }

  // Gera N cartoes aleatorios de uma vez e manda todos pro carrinho -
  // equivalente a tela "Aleatorio" do layout antigo, mas gerado no
  // cliente (o antigo gerava no servidor, o que exigia login). Como sao
  // aleatorios, combinacoes ja marcadas por outro jogador sao descartadas.
  async generateBulk() {
    if (this.checking) return;
    this.checking = true;

    const price = getBetPrice(this.gameConfig.key, this.gameConfig.minPick);
    const combos: number[][] = [];
    for (let i = 0; i < this.bulkQty; i++) {
      combos.push(this.randomCombo(this.gameConfig.minPick));
    }

    const duplicates = await this.checkDuplicates(combos);
    this.checking = false;

    let added = 0;
    let inCart = 0;
    let marked = 0;

    combos.forEach((combo, i) => {
      if (duplicates && duplicates[i]) {
        marked++;
      } else if (this.cart.add(this.gameConfig.key, combo, price)) {
        added++;
      } else {
        inCart++;
      }
    });

    if (added === 0) {
      this.showToast('Não foi possível gerar novos cartões (todos repetidos). Tente de novo.', 2500);
      return;
    }

    let msg = `${added} ${added === 1 ? 'cartão adicionado' : 'cartões adicionados'} ao carrinho!`;
    if (inCart) msg += ` ${inCart} já estava${inCart > 1 ? 'm' : ''} no carrinho.`;
    if (marked) msg += ` ${marked} descartado${marked > 1 ? 's' : ''} (dezenas já marcadas por outro jogador).`;
    this.showToast(msg, 3000);
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

  async addToCart() {
    if (!this.canAdd) {
      this.showToast(`Escolha de ${this.gameConfig.minPick} a ${this.gameConfig.maxPick} dezenas.`);
      return;
    }
    if (this.checking) return;
    if (this.cart.has(this.gameConfig.key, this.selected)) {
      this.showToast('Esse jogo já está no seu carrinho.');
      return;
    }

    // Copia a selecao: o usuario pode mexer nas dezenas durante a consulta.
    const numbers = [...this.selected];
    const price = this.subtotal;

    this.checking = true;
    const duplicates = await this.checkDuplicates([numbers]);
    this.checking = false;

    if (duplicates && duplicates[0]) {
      this.confirmDuplicate(numbers, price);
      return;
    }
    this.commitSelection(numbers, price, false);
  }

  private async confirmDuplicate(numbers: number[], price: number) {
    const alert = await this.alertCtrl.create({
      header: 'Cartão já marcado',
      message: 'Essas dezenas já foram marcadas por outro jogador neste jogo. Deseja marcar mesmo assim?',
      buttons: [
        { text: 'Escolher outros números', role: 'cancel' },
        { text: 'Marcar mesmo assim', handler: () => this.commitSelection(numbers, price, true) },
      ],
    });
    await alert.present();
  }

  // force = usuario ja viu o aviso de repetido e confirmou; o pagamento
  // envia com force pra API nao barrar de novo.
  private commitSelection(numbers: number[], price: number, force: boolean) {
    const added = this.cart.add(this.gameConfig.key, numbers, price, force);
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
