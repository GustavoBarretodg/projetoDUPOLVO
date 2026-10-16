import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { CartService, CartItem } from '../../services/cart.service';
import { StorageService } from '../../services/storage.service';
import { BetService } from '../../services/bet.service';
import { BolaoService } from '../../services/bolao.service';
import { GAME_CONFIGS, formatBRL } from 'src/app/shared/game-config';
import { calculateOrder } from 'src/app/shared/pricing';

@Component({
  selector: 'app-pagamento',
  templateUrl: './pagamento.page.html',
  styleUrls: ['./pagamento.page.scss'],
})
export class PagamentoPage implements OnInit {

  public user: any = null;
  public items: CartItem[] = [];
  public paymentMethod: 'pix' | 'card' = 'pix';
  public submitting = false;

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private cart: CartService,
    private storage: StorageService,
    private betSvc: BetService,
    private bolaoSvc: BolaoService
  ) {}

  async ngOnInit() {
    this.user = await this.storage.get('user').catch(() => null);
    if (!this.user || !this.user.id) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/pagamento' } });
      return;
    }

    this.items = this.cart.items;
    if (!this.items.length) {
      this.router.navigate(['/carrinho']);
    }
  }

  get orderTotals() {
    return calculateOrder(this.cart.getTotal(), this.user);
  }

  get subtotalLabel(): string {
    return formatBRL(this.orderTotals.subtotal);
  }

  get feeLabel(): string {
    return formatBRL(this.orderTotals.fee);
  }

  get total(): string {
    return formatBRL(this.orderTotals.total);
  }

  get isPremium(): boolean {
    return this.orderTotals.isPremium;
  }

  getGameName(key: string): string {
    return GAME_CONFIGS[key]?.name || key;
  }

  getGameColor(key: string): string {
    return GAME_CONFIGS[key]?.color || '#2F89C5';
  }

  formatPrice(value: number): string {
    return formatBRL(value);
  }

  // Envia os itens do carrinho um a um: apostas via addBet, cotas de
  // bolao via joinBolao. bet_exists/already_joined nao abortam o fluxo.
  async confirmOrder() {
    if (this.submitting || !this.items.length) return;
    this.submitting = true;

    let sent = 0;
    let duplicates = 0;
    let failures = 0;

    for (const item of this.items) {
      const outcome = item.type === 'bolao'
        ? await this.sendBolao(item)
        : await this.sendBet(item);

      if (outcome === 'ok') sent++;
      else if (outcome === 'dup') duplicates++;
      else failures++;
    }

    this.submitting = false;

    if (failures === this.items.length) {
      this.showToast('Não foi possível concluir seu pedido. Tente novamente.');
      return;
    }

    this.cart.clear();

    let msg = `${sent} ${sent === 1 ? 'item enviado' : 'itens enviados'}!`;
    if (duplicates) msg += ` ${duplicates} ${duplicates === 1 ? 'repetido' : 'repetidos'} (dezenas já marcadas em outro cartão).`;
    if (failures) msg += ` ${failures} falhou(aram).`;
    msg += ' Aguarde a confirmação do pagamento.';
    this.showToast(msg, 3500);

    this.router.navigate(['/conta']);
  }

  // Se as dezenas ja foram marcadas por outro jogador e o usuario ainda nao
  // tinha confirmado isso na tela do jogo, pergunta aqui antes de descartar.
  private async sendBet(item: CartItem): Promise<'ok' | 'dup' | 'fail'> {
    const outcome = await this.postBet(item, !!item.force);
    if (outcome !== 'dup' || item.force) return outcome;
    const confirmed = await this.askMarkAnyway(item);
    return confirmed ? this.postBet(item, true) : 'dup';
  }

  private postBet(item: CartItem, force: boolean): Promise<'ok' | 'dup' | 'fail'> {
    const params = {
      id_bet: 1020,
      id_user: this.user.id,
      bet: item.numbers,
      game_type: item.gameType,
      force,
    };
    return new Promise((resolve) => {
      this.betSvc.addBet(params as any).subscribe(
        (res) => resolve(res.message === 'bet_exists' ? 'dup' : 'ok'),
        () => resolve('fail')
      );
    });
  }

  private async askMarkAnyway(item: CartItem): Promise<boolean> {
    const numbers = (item.numbers || []).map(n => String(n).padStart(2, '0')).join(' ');
    const alert = await this.alertCtrl.create({
      header: 'Cartão já marcado',
      message: `As dezenas <strong>${numbers}</strong> já foram marcadas por outro jogador neste jogo. Deseja marcar mesmo assim?`,
      buttons: [
        { text: 'Não enviar', role: 'cancel' },
        { text: 'Marcar mesmo assim', role: 'confirm' },
      ],
      backdropDismiss: false,
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  private sendBolao(item: CartItem): Promise<'ok' | 'dup' | 'fail'> {
    return new Promise((resolve) => {
      this.bolaoSvc.joinBolao(item.bolaoId as number).subscribe(
        (res) => {
          if (res.message === 'joined') resolve('ok');
          else if (res.message === 'already_joined') resolve('dup');
          else resolve('fail');
        },
        () => resolve('fail')
      );
    });
  }

  goBack() {
    this.router.navigate(['/carrinho']);
  }

  private showToast(msg: string, duration = 2000) {
    this.toastCtrl.create({ message: msg, duration }).then(t => t.present());
  }
}
