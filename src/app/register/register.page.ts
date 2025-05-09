import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IonicModule, ToastController } from '@ionic/angular';
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
    private toastController: ToastController
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

  irALogin() {
    this.router.navigateByUrl('/login');
  }

  async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  async registrar() {
    if (!this.nombre || !this.email || !this.telefono || !this.password) {
      this.mostrarToast('Por favor, completa todos los campos obligatorios.', 'warning');
      return;
    }

    const usuario = {
      name: this.nombre,
      email: this.email,
      phone: this.telefono,
      password: this.password,
      foto: this.fotoBase64
    };

    this.http.post('http://localhost:8080/usuario/register', usuario).subscribe({
      next: async () => {
        this.mostrarToast('✅ Registro exitoso. Ya puedes iniciar sesión.', 'success');
        this.router.navigateByUrl('/login');
      },
      error: async (err) => {
        const mensaje = err.error || 'Error al registrar el usuario';
        this.mostrarToast(`❌ ${mensaje}`, 'danger');
      }
    });
  }
}
