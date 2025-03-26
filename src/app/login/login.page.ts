import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';  
import { IonicModule } from '@ionic/angular';   
import { FormsModule } from '@angular/forms';    

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true, 
  imports: [CommonModule, IonicModule, FormsModule],
})
export class LoginPage {

  username: string = '';
  password: string = '';
  errorMessage: string = '';
  passwordType: string = 'password'; // Esta propiedad manejará la visibilidad de la contraseña.

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        if (response) {
          this.router.navigate(['/parking']); 
        } else {
          this.errorMessage = 'Credenciales inválidas';
        }
      },
      (error) => {
        this.errorMessage = 'Hubo un error al procesar la solicitud';
      }
    );
  }

  register() {
    this.router.navigate(['/register']);
  }

  togglePassword() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }
}
