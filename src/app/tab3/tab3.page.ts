import { Component } from '@angular/core';
import { UserService } from '../services/user.service';  
import { Router } from '@angular/router';                
import { IonicModule } from '@ionic/angular';            
import { CommonModule } from '@angular/common';          
import { FormsModule } from '@angular/forms';            
import { UtilsService } from '../services/utils.service'; 
import { ToastController } from '@ionic/angular';         

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
    private utilsService: UtilsService,
    private toastController: ToastController
  ) { }

  // Muestra un toast de error (color rojo)
  async presentErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }

  // Muestra un toast de éxito (color verde)
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  fondosAAgregar: number = 0;  

  // Función para añadir fondos al monedero del usuario
  agregarFondos() {
    const cantidad = Number(this.fondosAAgregar);
    if (isNaN(cantidad) || cantidad <= 0) {
      this.presentErrorToast('❌ Ingresa una cantidad válida mayor a 0.');
      return;
    }

    // Suma la cantidad al monedero actual
    this.usuarioActual.monedero = Number(this.usuarioActual.monedero) + cantidad;

    // Actualiza el perfil en el backend
    this.userService.updatePerfil(this.usuarioActual).subscribe({
      next: (updatedUser) => {
        this.usuarioActual = updatedUser;  
        this.fondosAAgregar = 0;           
        this.presentToast(`✔️ Se añadieron ${cantidad}€ al monedero.`);
      },
      error: (err) => {
        console.error('Error al añadir fondos:', err);
        this.presentErrorToast('❌ No se pudo actualizar el monedero.');
      }
    });
  }

  // Método para capturar una foto usando el servicio utilitario
  async takeProfilePhoto() {
    const photo = await this.utilsService.takePicture('Captura tu foto de perfil');
    if (photo && photo.dataUrl) {
      this.usuarioActual.foto = photo.dataUrl;  
      console.log('Nueva foto base64:', photo.dataUrl);

      this.updateUserProfile();
    }
  }

  // Método para actualizar el perfil del usuario (nombre, email, foto, etc.)
  updateUserProfile() {
    this.userService.updatePerfil(this.usuarioActual).subscribe({
      next: (updatedUser) => {
        console.log('👤 Perfil actualizado correctamente', updatedUser);
        this.usuarioActual = updatedUser;
        this.presentToast('✔️ Perfil actualizado correctamente.');
      },
      error: (err) => {
        console.error('Error al actualizar el perfil:', err);
        this.presentErrorToast('❌ Error al actualizar el perfil. Email ya registrado.');
      }
    });
  }

  // Se ejecuta cuando el componente se inicia para cargar el usuario actual
  ngOnInit() {
    this.userService.getUser().subscribe(user => {
      this.usuarioActual = user;
      console.log('🧍 Usuario actual en Tab3Page:', user);
      console.log('📸 Foto base64:', user.foto); // Registro para debug de la foto
    });
  }

  // Getter para obtener la foto de perfil (si existe)
  get fotoPerfil(): string | null {
    return this.usuarioActual?.foto || null;
  }

  // Método para cerrar sesión y redirigir a la página de login/autenticación
  logout() {
    this.userService.logOut();
    this.router.navigateByUrl('/auth', { replaceUrl: true });
  }
}
