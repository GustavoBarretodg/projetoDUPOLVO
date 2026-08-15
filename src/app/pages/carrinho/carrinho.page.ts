import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { StorageService } from '../../services/storage.service';
import { GAME_CONFIGS, formatBRL } from 'src/app/shared/game-config';
import { calculateOrder } from 'src/app/shared/pricing';

@Component({
  selector: 'app-carrinho',
  templateUrl: './carrinho.page.html',
  styleUrls: ['./carrinho.page.scss'],
})
export class CarrinhoPage implements OnInit {

  public items$ = this.cart.items$;
  public user: any = null;

  constructor(
    private cart: CartService,
    private router: Router,
    private storage: StorageService
  ) {}

  ngOnInit() {
    this.storage.get('user').then((res) => {
      this.user = res || null;
    }).catch(() => {});
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

  get hasItems(): boolean {
    return this.cart.items.length > 0;
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

  remove(item: CartItem) {
    this.cart.remove(item.id);
  }

  goToGame() {
    this.router.navigate(['/jogar'], { queryParams: { game: 'LOTOFACIL' } });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  async goToPayment() {
    if (!this.hasItems) return;

    const user = await this.storage.get('user').catch(() => null);
    if (user && user.id) {
      this.router.navigate(['/pagamento']);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/pagamento' } });
    }
  }
}
