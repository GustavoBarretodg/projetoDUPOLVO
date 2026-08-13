import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(
    private router: Router,
    private storage: StorageService
  ) {}

  goToGame() {
    this.router.navigate(['/jogar'], { queryParams: { game: 'LOTOFACIL' } });
  }

  goToConta() {
    this.router.navigate(['/conta']);
  }

  async logout() {
    await this.storage.removeItem('user').catch(() => {});
    await this.storage.removeItem('token').catch(() => {});
    this.router.navigate(['/']);
  }
}
