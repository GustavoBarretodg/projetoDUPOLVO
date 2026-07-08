import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class SuperAdminGuard implements CanActivate {

  constructor(private storage: StorageService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const user = await this.storage.get('user');
    if (user && user.role === 'SUPER_ADMIN') {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
