import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';  
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
export class LoginPage implements OnInit {
  username: string = '';  // Inicializa como vacío
  password: string = '';
  errorMessage: string = '';
  passwordType: string = 'password'; 

  constructor(private authService: AuthService, private router: Router, private userService: UserService) {}

  ngOnInit() {
    // Cuando el componente se inicializa, obtenemos el usuario actual desde el servicio
    this.userService.getUser().subscribe(user => {
      if (user) {
        this.username = user.name;  // Si hay un usuario logueado, actualiza el nombre
      } else {
        this.username = '';  // Si no hay usuario, deja el nombre vacío
      }
    });
  }

  login() {
    this.authService.login(this.username, this.password).subscribe(
      (user) => {
        console.log('🔑 Usuario recibido en login.page.ts:', user); 
      
        if (user) {
          this.userService.setUser(user);  
          console.log('✅ Usuario guardado en UserService:', user);  
          this.router.navigate(['/tabs']);  
        } else {
          this.errorMessage = 'Credenciales inválidas';
        }
      },
      (error) => {
        this.errorMessage = 'Hubo un error al procesar la solicitud';
        console.error('❌ Error en login:', error);
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
