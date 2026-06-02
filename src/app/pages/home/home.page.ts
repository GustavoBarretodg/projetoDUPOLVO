import { Component, OnInit } from '@angular/core';
import { DummyService } from 'src/app/services/dummy.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  homes;
  plt;
  constructor(private dummy: DummyService, private router: Router) {
    this.plt = localStorage.getItem('platform');
    this.homes = this.dummy.homes;
  }

  ngOnInit() {
  }

  goToChose() {
    this.router.navigate(['/property-detail']);
  }

  goToRandom() {
    this.router.navigate(['/property-random']);
  }

  goToUnfolding() {
    this.router.navigate(['/property-unfolding']);
  }
}
