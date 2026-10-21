import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SessionService } from './services/session.service';

// De quanto em quanto tempo o app confere se o login venceu com a tela parada.
const SESSION_CHECK_MS = 60 * 1000;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  plt;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private session: SessionService
  ) {
    this.initializeApp();
    this.watchSession();
  }

  // Desloga quando o token vence: ao abrir o app, a cada troca de tela e
  // de minuto em minuto (pra quem deixou o app aberto parado).
  watchSession() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.session.checkSession());
    setInterval(() => this.session.checkSession(), SESSION_CHECK_MS);
  }

  initializeApp() {
    this.platform.ready().then(() => {

      if (this.platform.is('ios')) {
        localStorage.setItem('platform', 'ios');
        this.plt = localStorage.getItem('platform');
      } else {
        localStorage.setItem('platform', 'android');
        this.plt = localStorage.getItem('platform');
        console.log(this.plt);
      }

      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
