import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DummyService {

  homes = [
    {
      img : 'assets/imgs/1.jpg',
      addr : 'Chitra/Bhavnagar',
      bed : '4',
      bath : '3',
      area : '250',
      price : '200.00'
    },
    {
      img : 'assets/imgs/2.jpg',
      addr : 'Sadarnagar/Bhavnagar',
      bed : '3',
      bath : '2',
      area : '240',
      price : '250.00'
    },
    {
      img : 'assets/imgs/3.jpg',
      addr : 'Ghogha Circle/Bhavnagar',
      bed : '4',
      bath : '3',
      area : '260',
      price : '300.00'
    },
    {
      img : 'assets/imgs/4.jpg',
      addr : 'Kalvibid/Bhavnagar',
      bed : '5',
      bath : '3',
      area : '270',
      price : '350.00'
    },
    {
      img : 'assets/imgs/5.jpg',
      addr : 'Chitra/Bhavnagar',
      bed : '2',
      bath : '2',
      area : '200',
      price : '200.00'
    },
    {
      img : 'assets/imgs/6.jpg',
      addr : 'Hilldrive/Bhavnagar',
      bed : '4',
      bath : '3',
      area : '300',
      price : '250.00'
    },
    {
      img : 'assets/imgs/7.jpg',
      addr : 'Kalvibid/Bhavnagar',
      bed : '4',
      bath : '3',
      area : '250',
      price : '200.00'
    }
  ];
  constructor() { }
}
