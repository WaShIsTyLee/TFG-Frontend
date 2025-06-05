import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AuthPage {
  // Variables para controlar el estado de la página (login o registro) y datos del formulario
  isRegistering: boolean = false;
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  nombre: string = '';
  email: string = '';
  telefono: string = '';
  monedero: number = 0;
  fotoBase64: string | null = null;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private authService: AuthService,
    private userService: UserService,
    private http: HttpClient
  ) { }

  // Alterna la visibilidad de la contraseña en el formulario
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Cambia entre modo login y registro
  toggleMode() {
    this.isRegistering = !this.isRegistering;
  }

  // Muestra mensajes emergentes al usuario
  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    toast.present();
  }

  // Lógica para iniciar sesión: valida campos, llama al servicio, guarda usuario y navega
  login() {
    if (!this.username || !this.password) {
      this.showToast('Por favor completa todos los campos', 'warning');
      return;
    }
    this.authService.login(this.username, this.password).subscribe({
      next: user => {
        if (user) {
          this.userService.setUser(user);
          localStorage.setItem('usuario', JSON.stringify(user));
          this.showToast(`✔️ Bienvenido ${user.name}`, 'success');
          this.router.navigate(['/tabs']);
        } else {
          this.showToast('Credenciales inválidas', 'danger');
        }
      },
      error: error => {
        this.showToast('Error de conexión. Intenta más tarde.', 'danger');
      }
    });
  }

  // Lógica para registrar usuario: valida campos, formato email y envía datos al backend
  async registrar() {
    if (!this.nombre || !this.email || !this.telefono || !this.password) {
      this.showToast('Por favor, completa todos los campos obligatorios.', 'warning');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.showToast('El correo electrónico no tiene un formato válido.', 'danger');
      return;
    }
    const usuario = {
      name: this.nombre,
      email: this.email,
      phone: this.telefono,
      password: this.password,
      monedero: this.monedero,
      foto: this.fotoBase64
    };
    this.http.post('http://localhost:8080/usuario/register', usuario).subscribe({
      next: () => {
        this.showToast('✅ Registro exitoso. Ya puedes iniciar sesión.', 'success');
        this.toggleMode(); // Cambia a modo login después del registro
      },
      error: err => {
        const mensaje = err.error || 'Error al registrar el usuario';
        this.showToast(`❌ ${mensaje}`, 'danger');
      }
    });
  }

  // Permite tomar una foto con la cámara y guardar la imagen en base64
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
}
