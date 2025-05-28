import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class LoginPage implements OnInit {
  username: string = 'admin@admin.com';
  password: string = 'admin';
  passwordType: string = 'password';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  togglePassword() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  logout() {
    this.userService.logOut();
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: color,
    });
    toast.present();
  }

  login() {
    if (!this.username || !this.password) {
      this.presentToast('Por favor completa todos los campos', 'warning');
      return;
    }

    this.authService.login(this.username, this.password).subscribe(
      user => {
        console.log('🧾 Usuario recibido del backend:', user);

        if (user) {
          this.userService.setUser(user);
          localStorage.setItem('usuario', JSON.stringify(user));
          this.presentToast(`✔️ Bienvenido ${user.name}`, 'success');
          this.router.navigate(['/tabs']);
        } else {
          this.presentToast('Credenciales inválidas', 'danger');
        }
      },
      error => {
        console.error('❌ Error en login:', error);
        this.presentToast('Error de conexión. Intenta más tarde.', 'danger');
      }
    );
  }

  register() {
    this.router.navigate(['/register']);
  }
}
