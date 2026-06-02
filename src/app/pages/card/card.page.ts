import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { BetService } from '../../services/bet.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.page.html',
  styleUrls: ['./card.page.scss'],
})
export class CardPage implements OnInit {
  public user = {
    id: '',
    name:  '',
    email: '',
    phone: ''
  };

  public cards: any = [];

/*
  public cards : Array<{ id: string, status: boolean, numbers: string }> = [
    { 
      id : '1020', 
      numbers: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15',
      status : true,
    },
    { 
      id : '1021', 
      numbers: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15',
      status : true,
    },
    { 
      id : '1022', 
      numbers: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15',
      status : false,
    },
  ];
*/

  constructor(
    private toastCtrl: ToastController,
    private betSvc: BetService,
    private storage: StorageService
  ) {
    this.getUser();
  }

  ngOnInit() {
    console.log('init..');
    this.getUser();
    //this.getUserBet()
  }

  ngAfterViewInit() {
    //this.getUser();
  }

  getUser() {
    this.storage.get('user').then((res) => { 
        this.user = res;
        this.getUserBet();
        //console.log('user =', this.user);
    }) 
    .catch((error) => { 
        console.log(error); 
    }); 
  }

  getUserBet()
  {
    if(this.user.id) {  
      let params: any = {
        id_user: this.user.id,
      };

      this.betSvc.getBet(params).subscribe((res) => {
        console.log('res=', res.data, res.data.length);
        if(res.data.length === 0) {
          this.showToast('Você ainda não possui cartões');
          return false;
        }

        this.cards = res.data;
      }, (error) => {
        this.showToast('Falha ao buscar cartões');
      })
    }
  }

  public captureId(id: any) : void
  {
    //console.log(`Captured name by event value: ${id}`);
    if(id) {
      let params: any = {
        id_bet: id
      };

      this.betSvc.removeBet(params).subscribe((res) => {
        this.showToast('Cartão removido com sucesso!');
        this.getUserBet();
      }, (error) => {
        this.showToast('Falha ao remover Cartão');
      });
    }
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
