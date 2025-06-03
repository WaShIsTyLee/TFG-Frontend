import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' // Servicio disponible en toda la app
})
export class UserService {
  private apiUrl = 'http://3.92.105.120:8080/usuario';  // URL base para usuario
  private userSubject = new BehaviorSubject<any>(null);  // Estado reactivo para el usuario

  constructor(private http: HttpClient) { }

  // Guarda el usuario actual y asigna un flag 'admin' si su email termina en '@admin.com'
  setUser(user: any) {
    const isAdmin = user?.email?.toLowerCase().endsWith('@admin.com'); 
    user.admin = isAdmin;
    console.log('💾 Guardando usuario en UserService:', user);
    this.userSubject.next(user);
  }

  // Devuelve un Observable para subscribirse a los cambios del usuario actual
  getUser(): Observable<any> {
    return this.userSubject.asObservable();
  }

  // Limpia el usuario (cerrar sesión)
  logOut() {
    this.userSubject.next(null);
  }
  
  // Obtiene datos de un usuario por su ID vía HTTP GET
  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getById/${id}`);
  }

  // Actualiza el perfil del usuario vía HTTP PUT, y actualiza el estado local al recibir la respuesta
  updatePerfil(usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updatePerfil`, usuario).pipe(
      tap(updatedUsuario => {
        console.log('👤 Perfil de usuario actualizado', updatedUsuario);
        this.setUser(updatedUsuario);  // Actualiza el usuario guardado tras la actualización
      })
    );
  }
}
