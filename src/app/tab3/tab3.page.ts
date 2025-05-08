import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilsService } from '../services/utils.service'; // Importa el servicio

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
    private router: Router,
    private utilsService: UtilsService // Inyecta el servicio aquí
  ) {}

  // Método para capturar una foto
  async takeProfilePhoto() {
    const photo = await this.utilsService.takePicture('Captura tu foto de perfil');
    if (photo && photo.dataUrl) {
      // Asignamos la foto al objeto usuarioActual
      this.usuarioActual.foto = photo.dataUrl;
      console.log('Nueva foto base64:', photo.dataUrl);

      // Llama al método para actualizar el perfil en el backend
      this.updateUserProfile();
    }
  }

  // Método para actualizar el perfil del usuario
  updateUserProfile() {
    this.userService.updatePerfil(this.usuarioActual).subscribe({
      next: (updatedUser) => {
        console.log('👤 Perfil actualizado correctamente', updatedUser);
        this.usuarioActual = updatedUser; // Actualiza el usuario con los nuevos datos
      },
      error: (err) => {
        console.error('Error al actualizar el perfil:', err);
      }
    });
  }

  // Método ngOnInit para cargar el usuario
  ngOnInit() {
    this.userService.getUser().subscribe(user => {
      this.usuarioActual = user;
      console.log('🧍 Usuario actual en Tab3Page:', user);
      console.log('📸 Foto base64:', user.foto); // AÑADE ESTA LÍNEA
    });
  }

  // Getter para la foto de perfil
  get fotoPerfil(): string | null {
    return this.usuarioActual?.foto || null;
  }

  // Método para cerrar sesión
  logout() {
    this.userService.logOut();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
