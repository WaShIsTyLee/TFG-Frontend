import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definir la interfaz Usuario si es necesario
export interface Usuario {
  id: number;  // Cambiado de id_usuario a id
  name: string;
  email: string;
  phone: string;
  password: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/usuario';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<Usuario> {
    const credentials = { email, password };
    console.log('Enviando credenciales:', credentials);  
    return this.http.post<Usuario>(`${this.apiUrl}/login`, credentials);
  }

  register(name: string, email: string, phone: string, password: string): Observable<any> {
    const userData = { name, email, phone, password };
    console.log('Registrando usuario:', userData);
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }
}
