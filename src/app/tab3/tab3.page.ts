import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class Tab3Page {
  usuarioActual: any;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userService.getUser().subscribe(user => {
      this.usuarioActual = user;
      console.log('🧍 Usuario actual en Tab3Page:', user);
      console.log('📸 Foto base64:', user.foto); // AÑADE ESTA LÍNEA
    });
  }
  

  get fotoPerfil(): string | null {
    return this.usuarioActual?.foto || null;
  }
  

  logout() {
    this.userService.logOut();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
