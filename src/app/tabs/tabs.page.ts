import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';  
import { Router } from '@angular/router';  // Necesitamos Router para redirigir
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class TabsPage implements OnInit {
  user: any = null;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    // Nos suscribimos al observable de usuario
    this.userService.getUser().subscribe((user) => {
      this.user = user;  // Guardamos el usuario recibido
    });
  }

  // Método para cerrar sesión
  logOut() {
    this.userService.logOut();  // Borra el usuario del servicio
    this.router.navigate(['/login']);  // Redirige a la página de login
  }
}
