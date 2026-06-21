import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'card',
        loadChildren: () => import('../card/card.module').then(m => m.CardPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'help',
        loadChildren: () => import('../help/help.module').then(m => m.HelpPageModule)
      },
      {
        path: 'about',
        loadChildren: () => import('../about/about.module').then(m => m.AboutPageModule)
      },
      {
        path: 'property-detail',
        loadChildren: () => import('../property-detail/property-detail.module').then(m => m.PropertyDetailPageModule)
      },
      {
        path: 'property-random',
        loadChildren: () => import('../property-random/property-random.module').then(m => m.PropertyRandomPageModule)
      },
      {
        path: 'property-unfolding',
        loadChildren: () => import('../property-unfolding/property-unfolding.module').then(m => m.PropertyUnfoldingPageModule)
      },
      {
        path: 'game-mode',
        loadChildren: () => import('../game-mode/game-mode.module').then(m => m.GameModePageModule)
      },
      {
        path: 'confirmed',
        loadChildren: () => import('../confirmed/confirmed.module').then(m => m.ConfirmedPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
