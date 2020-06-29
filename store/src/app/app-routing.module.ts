import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotExistComponent } from './shared/components/error/not-exist.component';
import { AuthGuard } from './shared/Guards/auth.guard';
import { UnAuthGuard } from './shared/Guards/unauth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/home/home.module').then((m) => m.HomeModule)
  },
  { path: 'home', pathMatch: 'full', redirectTo: '' },
  {
    path: '',
    loadChildren: () =>
      import('./pages/authentication/authentication.module').then((m) => m.AuthenticationModule),
    canActivate: [UnAuthGuard]
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('./pages/categories/categories.module').then((m) => m.CategoriesModule)
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./pages/products/products.module').then((m) => m.ProductsModule)
  },
  {
    path: 'cart',
    loadChildren: () =>
      import('./pages/cart/cart.module').then((m) => m.CartModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./pages/check-out/check-out.module').then((m) => m.CheckOutModule),
    canActivate: [AuthGuard]
  },
  { path: '**', component: NotExistComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
