import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.scss'],
})
export class ForgotPage implements OnInit {

  otp = false;
  constructor(private router: Router) { }

  ngOnInit() {
  }

  SendOtp() {
    this.otp = true;
  }

  verify() {
    this.router.navigate(['/change-password']);
  }

}
