import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegisterPage {
  nombre: string = '';
  email: string = '';
  telefono: string = '';
  password: string = '';
  fotoBase64: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private alertController: AlertController
  ) {}

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      this.fotoBase64 = `data:image/jpeg;base64,${image.base64String}`;
    } catch (error) {
      console.error('Error al tomar la foto', error);
    }
  }

  async registrar() {
    const usuario = {
      name: this.nombre,
      email: this.email,
      phone: this.telefono,
      password: this.password,
      foto: this.fotoBase64
    };

    this.http.post('http://localhost:8080/usuario/register', usuario).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Registro exitoso',
          message: 'Ya puedes iniciar sesión',
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigateByUrl('/login');
      },
      error: async (err) => {
        const alert = await this.alertController.create({
          header: 'Error',
          message: err.error || 'Error al registrar el usuario',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}
