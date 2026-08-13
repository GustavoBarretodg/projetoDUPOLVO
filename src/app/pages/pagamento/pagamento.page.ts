import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { CartService, CartItem } from '../../services/cart.service';
import { StorageService } from '../../services/storage.service';
import { BetService } from '../../services/bet.service';
import { GAME_CONFIGS, formatBRL } from 'src/app/shared/game-config';

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
    private cart: CartService,
    private storage: StorageService,
    private betSvc: BetService
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

  get total(): string {
    return formatBRL(this.cart.getTotal());
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

  // Envia as apostas do carrinho uma a uma; bet_exists nao aborta o fluxo.
  async confirmOrder() {
    if (this.submitting || !this.items.length) return;
    this.submitting = true;

    let sent = 0;
    let duplicates = 0;
    let failures = 0;

    for (const item of this.items) {
      const params = {
        id_bet: 1020,
        id_user: this.user.id,
        bet: item.numbers,
        game_type: item.gameType,
      };

      const outcome = await new Promise<'ok' | 'dup' | 'fail'>((resolve) => {
        this.betSvc.addBet(params as any).subscribe(
          (res) => resolve(res.message === 'bet_exists' ? 'dup' : 'ok'),
          () => resolve('fail')
        );
      });

      if (outcome === 'ok') sent++;
      else if (outcome === 'dup') duplicates++;
      else failures++;
    }

    this.submitting = false;

    if (failures === this.items.length) {
      this.showToast('Não foi possível enviar suas apostas. Tente novamente.');
      return;
    }

    this.cart.clear();

    let msg = `${sent} ${sent === 1 ? 'aposta enviada' : 'apostas enviadas'}!`;
    if (duplicates) msg += ` ${duplicates} já existia(m).`;
    if (failures) msg += ` ${failures} falhou(aram).`;
    msg += ' Aguarde a confirmação do pagamento.';
    this.showToast(msg, 3500);

    this.router.navigate(['/conta']);
  }

  goBack() {
    this.router.navigate(['/carrinho']);
  }

  private showToast(msg: string, duration = 2000) {
    this.toastCtrl.create({ message: msg, duration }).then(t => t.present());
  }
}
