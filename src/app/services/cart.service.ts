import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from './storage.service';

export interface CartItem {
  id: string;
  gameType: string;
  numbers: number[];
  price: number;
  createdAt: string;
}

const CART_KEY = 'cart';

// Carrinho local (pre-login), persistido no @ionic/storage. As apostas
// so vao pra API no fluxo de pagamento, depois do login.
@Injectable({ providedIn: 'root' })
export class CartService {

  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  public items$: Observable<CartItem[]> = this.itemsSubject.asObservable();
  public count$: Observable<number> = this.items$.pipe(map(items => items.length));

  private loaded = false;

  constructor(private storage: StorageService) {
    this.load();
  }

  private async load() {
    if (this.loaded) return;
    const stored = await this.storage.get(CART_KEY).catch(() => null);
    this.itemsSubject.next(Array.isArray(stored) ? stored : []);
    this.loaded = true;
  }

  get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  /** Adiciona ao carrinho. Retorna false se ja existe jogo identico (mesmo tipo + mesmas dezenas). */
  add(gameType: string, numbers: number[], price: number): boolean {
    const sorted = [...numbers].sort((a, b) => a - b);
    const duplicate = this.items.some(item =>
      item.gameType === gameType &&
      item.numbers.length === sorted.length &&
      item.numbers.every((n, i) => n === sorted[i])
    );
    if (duplicate) return false;

    const item: CartItem = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      gameType,
      numbers: sorted,
      price,
      createdAt: new Date().toISOString(),
    };
    this.persist([...this.items, item]);
    return true;
  }

  remove(id: string) {
    this.persist(this.items.filter(item => item.id !== id));
  }

  clear() {
    this.persist([]);
  }

  private persist(items: CartItem[]) {
    this.itemsSubject.next(items);
    this.storage.set(CART_KEY, items);
  }
}
