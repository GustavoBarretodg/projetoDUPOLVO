import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { BolaoService } from '../../services/bolao.service';
import { GAME_CONFIGS } from '../../shared/game-config';

@Component({
  selector: 'app-bolao',
  templateUrl: './bolao.page.html',
  styleUrls: ['./bolao.page.scss'],
})
export class BolaoPage implements OnInit {

  bolaos: any[] = [];
  loading = true;
  joinedIds = new Set<number>();

  constructor(
    private bolaoSvc: BolaoService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
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

  joinBolao(bolao: any) {
    this.bolaoSvc.joinBolao(bolao.id).subscribe((res) => {
      if (res.message === 'joined') {
        this.joinedIds.add(bolao.id);
        bolao.takenQuotas++;
        bolao.availableQuotas--;
        this.showToast('Você entrou no bolão! Aguarde confirmação do pagamento.');
      } else if (res.message === 'already_joined') {
        this.joinedIds.add(bolao.id);
        this.showToast('Você já está inscrito neste bolão.');
      } else if (res.message === 'bolao_full') {
        this.showToast('Este bolão está lotado.');
      } else if (res.message === 'bolao_closed') {
        this.showToast('Este bolão está encerrado.');
      }
    }, () => {
      this.showToast('Erro ao entrar no bolão. Tente novamente.');
    });
  }

  isJoined(id: number): boolean {
    return this.joinedIds.has(id);
  }

  getGameColor(key: string): string {
    return (GAME_CONFIGS as any)[key]?.color || '#2F89C5';
  }

  getGameName(key: string): string {
    return (GAME_CONFIGS as any)[key]?.name || key;
  }

  goBack() {
    this.router.navigate(['/tabs/home']);
  }

  showToast(msg: string) {
    this.toastCtrl.create({ message: msg, duration: 2500 }).then(t => t.present());
  }
}
