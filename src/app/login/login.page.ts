import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class LoginPage implements OnInit {

  username: string = '';
  password: string = '';
  passwordType: string = 'password';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private alertController: AlertController
  ) {}

  ngOnInit() {}

  togglePassword() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  logout() {
    this.userService.logOut();
  }

  login() {
    if (!this.username || !this.password) {
      this.presentAlert('Por favor completa todos los campos');
      return;
    }

    this.authService.login(this.username, this.password).subscribe(
      user => {
        console.log('🧾 Usuario recibido del backend:', user);  // 👈 AÑÁDELO AQUÍ
    
        if (user) {
          this.userService.setUser(user);
          localStorage.setItem('usuario', JSON.stringify(user));  // 👈 GUÁRDALO TAMBIÉN
          this.router.navigate(['/tabs']);
        } else {
          this.presentAlert('Credenciales inválidas');
        }
      },
      error => {
        console.error('❌ Error en login:', error);
        this.presentAlert('Error de conexión. Intenta más tarde.');
      }
    );
    
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error de inicio de sesión',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  register() {
    console.log('Registrarse con Username:', this.username, 'Password:', this.password);
  }
}
