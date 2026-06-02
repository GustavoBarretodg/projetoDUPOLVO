import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { BetService } from '../../services/bet.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-property-unfolding',
  templateUrl: './property-unfolding.page.html',
  styleUrls: ['./property-unfolding.page.scss'],
})
export class PropertyUnfoldingPage implements OnInit {
   public user = {
    id: '',
    name:  '',
    email: '',
    phone: ''
  };

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private betSvc: BetService,
    private storage: StorageService
  ) {
  
  }

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    this.storage.get('user').then((res) => { 
        this.user = res;
        //console.log('user =', this.user);
    }) 
    .catch((error) => { 
        console.log(error); 
    }); 
  }

  goBack() {
    this.navCtrl.back();
  }

  onSave(qtdCard) {
    if(!qtdCard.value) {
      this.showToast('Escolha a quantidade de cartões para jogar');
      return false;
    }

    let params: any = {
      id_bet: 1040,
      id_user: this.user.id,
      qtd_card: qtdCard.value,
      paid: 0
    };

    this.betSvc.addBetRandom(params).subscribe((res) => {
      console.log('res=', params);
      this.showToast('Cartão salvo com sucesso!');
      this.router.navigate(['/tabs/home']);
    }, (error) => {
      this.showToast('Falha ao criar Cartão');
    });
  }

  showToast(msg) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000
    }).then((toastData) => {
      toastData.present();
    });
  }
}
