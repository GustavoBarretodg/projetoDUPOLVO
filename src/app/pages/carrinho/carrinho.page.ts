import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { StorageService } from '../../services/storage.service';
import { GAME_CONFIGS, formatBRL } from 'src/app/shared/game-config';

@Component({
  selector: 'app-carrinho',
  templateUrl: './carrinho.page.html',
  styleUrls: ['./carrinho.page.scss'],
})
export class CarrinhoPage {

  public items$ = this.cart.items$;

  constructor(
    private cart: CartService,
    private router: Router,
    private storage: StorageService
  ) {}

  get total(): string {
    return formatBRL(this.cart.getTotal());
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
