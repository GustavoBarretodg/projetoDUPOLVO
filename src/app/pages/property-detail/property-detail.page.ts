import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { BetService } from '../../services/bet.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-property-detail',
  templateUrl: './property-detail.page.html',
  styleUrls: ['./property-detail.page.scss'],
})
export class PropertyDetailPage implements OnInit {
  counter: number = 0;
  numbers: any = [];
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

  onSave() {
    if(this.numbers.length !== 15) {
      this.showToast('Escolha 15 números para jogar');
      return false;
    }

    let params: any = {
      id_bet: 1020,
      id_user: this.user.id,
      bet: this.numbers.sort(function(a, b){return a-b}),
      paid: 0
    };

    this.betSvc.addBet(params).subscribe((res) => {
      //console.log('res=', res);
      if(res.message === 'bet_exists') {
        this.showToast('Esse cartão já existe, escolha outros números!');  
        return false;
      }

      this.showToast('Cartão salvo com sucesso!');
      this.router.navigate(['/tabs/home']);
    }, (error) => {
      this.showToast('Falha ao criar Cartão');
    });
  }

  highlightItem(event, index) {

    if (! event.target.classList.contains('highlighted')) {
      if(this.counter < 15) {
        event.target.classList.add('highlighted');
        this.counter++;
        this.addItem(index);
        //console.log('counter ++', this.counter);
      }
      this.checkQty();
    } else {
      event.target.classList.remove('highlighted');
      this.counter--;
      this.delItem(index);
      this.checkQty();
      //console.log('counter --', this.counter);
    }
    
  }

  addItem(index) {
    this.numbers.push(index);
  }

  delItem(index) {
    let arr = this.numbers;

    for( var i = 0; i < arr.length; i++){ 
                                   
        if ( arr[i] === index) { 
            arr.splice(i, 1); 
            i--; 
        }
    }

    this.numbers = arr;
  }

  checkQty() {
    if(this.counter === 15) {
      this.showToast('Você já escolheu 15 números');
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
