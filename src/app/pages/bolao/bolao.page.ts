import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { BolaoService } from '../../services/bolao.service';
import { CartService } from '../../services/cart.service';
import { GAME_CONFIGS, GAME_LIST } from '../../shared/game-config';
import { FAKE_BOLOES } from '../../shared/bolao-mock';

@Component({
  selector: 'app-bolao',
  templateUrl: './bolao.page.html',
  styleUrls: ['./bolao.page.scss'],
})
export class BolaoPage implements OnInit {

  bolaos: any[] = [];
  loading = true;
  gameFilter: string | null = null;
  gameList = GAME_LIST;

  constructor(
    private bolaoSvc: BolaoService,
    private cart: CartService,
    private toastCtrl: ToastController,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.gameFilter = this.route.snapshot.queryParams['game'] || null;
    this.load();
  }

  get displayBolaos(): any[] {
    if (this.loading) return [];
    const list = this.bolaos.length ? this.bolaos : FAKE_BOLOES;
    return this.gameFilter ? list.filter(b => b.gameType === this.gameFilter) : list;
  }

  get pageTitle(): string {
    return this.gameFilter ? `Bolões de ${this.getGameName(this.gameFilter)}` : 'Bolões Disponíveis';
  }

  get showingFake(): boolean {
    return !this.loading && this.bolaos.length === 0;
  }

  load() {
    this.loading = true;
    this.bolaoSvc.getAllOpen().subscribe((res) => {
      this.bolaos = res.data || [];
      this.loading = false;
    }, () => {
      this.loading = false;
      this.showToast('Erro ao carregar bolões.');
    });
  }

  // Entrar no bolao so adiciona a cota ao carrinho local - a inscricao
  // de verdade (joinBolao na API) so acontece no fluxo de pagamento,
  // depois do login, igual as apostas de loteria.
  joinBolao(bolao: any) {
    if (bolao.fake) {
      this.showToast('Esse bolão é só um exemplo ilustrativo.');
      return;
    }
    if (bolao.availableQuotas === 0) {
      this.showToast('Este bolão está lotado.');
      return;
    }
    const added = this.cart.addBolao(bolao.id, bolao.gameType, bolao.name, bolao.pricePerQuota);
    if (!added) {
      this.showToast('Esse bolão já está no seu carrinho.');
      return;
    }
    this.showToast('Cota adicionada ao carrinho!');
  }

  isInCart(id: number): boolean {
    return this.cart.isBolaoInCart(id);
  }

  getGameColor(key: string): string {
    return (GAME_CONFIGS as any)[key]?.color || '#2F89C5';
  }

  // Cor de destaque com baixa opacidade (hex + alfa), usada como fundo do
  // badge circular no card - mantém o card branco/claro do resto do app.
  getGameColorSoft(key: string): string {
    return this.getGameColor(key) + '1F';
  }

  getGameName(key: string): string {
    return (GAME_CONFIGS as any)[key]?.name || key;
  }

  getGameIcon(key: string): string {
    return (GAME_CONFIGS as any)[key]?.icon || 'ticket-outline';
  }

  setFilter(key: string | null) {
    this.gameFilter = key;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  showToast(msg: string) {
    this.toastCtrl.create({ message: msg, duration: 2500 }).then(t => t.present());
  }
}
