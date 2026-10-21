import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { SessionService } from '../services/session.service';

@Injectable({ providedIn: 'root' })
export class SuperAdminGuard implements CanActivate {

  constructor(private storage: StorageService, private router: Router, private session: SessionService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    // Login vencido: desloga e volta pra essa tela depois de entrar de novo.
    if (await this.session.getStatus() === 'expired') {
      await this.session.expireSession(state.url);
      return false;
    }
    const user = await this.storage.get('user');
    if (user && user.role === 'SUPER_ADMIN') {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
