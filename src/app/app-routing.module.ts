import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login/login.page';  
import { HomePage } from './home/home.page';  
import { ParkingPage } from './parking/parking.page'; 
import { RegisterPage } from './register/register.page';

const routes: Routes = [
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'register',
    component: RegisterPage ,
  },
  {
    path: 'home',
    component: HomePage,
  },
  {
    path: 'parking',
    component: ParkingPage,  
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
