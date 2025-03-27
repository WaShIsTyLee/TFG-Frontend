import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../services/auth.service'; 
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  standalone: true,
  styleUrls: ['./register.page.scss'],
  imports: [IonicModule, FormsModule],
})
export class RegisterPage implements OnInit {
  user = {
    name: '',
    email: '',
    phone: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {}

  registerUser() {
    if (this.isValidForm()) {
      this.authService.register(this.user.name, this.user.email, this.user.phone, this.user.password).subscribe(
        (response) => {
          console.log('Usuario registrado exitosamente:', response);
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error en el registro:', error);
        }
      );
    } else {
      console.log('Formulario inválido');
    }
  }

  isValidForm() {
    return this.user.name && this.user.email && this.user.phone && this.user.password;
  }

  login() {
    this.router.navigate(['/login']);
  }
}
