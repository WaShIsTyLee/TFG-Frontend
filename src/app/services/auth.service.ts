import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definición de la interfaz Usuario para tipar los datos del usuario
export interface Usuario {
  id: number;  
  name: string;
  email: string;
  phone: string;
  password: string;
}

@Injectable({
  providedIn: 'root' // Hace que el servicio sea accesible en toda la aplicación
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/usuario'; // URL base para las peticiones al backend

  constructor(private http: HttpClient) {}

  // Método para enviar credenciales al backend y autenticar al usuario
  login(email: string, password: string): Observable<Usuario> {
    const credentials = { email, password };
    console.log('Enviando credenciales:', credentials);  
    return this.http.post<Usuario>(`${this.apiUrl}/login`, credentials);
  }

  // Método para registrar un nuevo usuario enviando sus datos al backend
  register(name: string, email: string, phone: string, password: string): Observable<any> {
    const userData = { name, email, phone, password };
    console.log('Registrando usuario:', userData);
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }
}
