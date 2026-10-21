import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

// Controle da validade do login no proprio app. O JWT vence em 24h, mas o
// backend so avisa (401) quando chega uma chamada protegida - em tela publica
// (landing, jogar, bolao) ou com o app parado o usuario continuava "logado".
// Aqui o app le o "exp" do token e encerra a sessao sozinho quando vence.
@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private expiring = false;

  constructor(private storage: StorageService, private router: Router) {}

  // true quando o token nao existe, nao da pra ler ou ja passou do "exp".
  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
      const exp = JSON.parse(atob(padded)).exp;
      return typeof exp !== 'number' || Date.now() >= exp * 1000;
    } catch (e) {
      return true;
    }
  }

  // 'valid': logado com token dentro da validade; 'expired': tinha login
  // salvo mas venceu (ou ficou pela metade); 'none': nunca logou.
  async getStatus(): Promise<'valid' | 'expired' | 'none'> {
    const token = await this.storage.get('token').catch(() => null);
    const user = await this.storage.get('user').catch(() => null);
    if (!token && !user) return 'none';
    if (token && user && !this.isTokenExpired(token)) return 'valid';
    return 'expired';
  }

  // Usado no inicio do app e a cada troca de tela: se o login venceu,
  // desloga e manda pro login.
  async checkSession(): Promise<void> {
    if (await this.getStatus() === 'expired') {
      await this.expireSession();
    }
  }

  // Remove so o login (o carrinho fica salvo) e manda pro login com
  // returnUrl pra voltar a tela certa depois de entrar de novo.
  async expireSession(returnUrl: string = this.router.url): Promise<void> {
    if (this.expiring) return;
    this.expiring = true;
    try {
      await this.storage.removeItem('token').catch(() => {});
      await this.storage.removeItem('user').catch(() => {});
      // Sem await: dentro de um guard a navegacao atual ainda esta em
      // andamento, e esperar a nova poderia travar as duas.
      if (!returnUrl.startsWith('/login')) {
        this.router.navigate(['/login'], {
          queryParams: returnUrl && returnUrl !== '/' ? { returnUrl } : {},
        });
      }
    } finally {
      this.expiring = false;
    }
  }
}
