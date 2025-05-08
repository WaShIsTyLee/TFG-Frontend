import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Asegúrate de importar HttpClient
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';  // Si estás usando variables de entorno

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/usuario';  // Cambia esto según tu entorno de producción o desarrollo
  private userSubject = new BehaviorSubject<any>(null);  // Inicializa con null

  constructor(private http: HttpClient) { }  // Inyecta HttpClient en el constructor

  setUser(user: any) {
    console.log('💾 Guardando usuario en UserService:', user);
    this.userSubject.next(user);  // Actualiza el usuario
  }

  getUser(): Observable<any> {
    return this.userSubject.asObservable();  // Devuelve el usuario en forma observable
  }

  logOut() {
    this.userSubject.next(null);  // Borra el usuario
  }

  updatePerfil(usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updatePerfil`, usuario).pipe(
      tap(updatedUsuario => {
        console.log('👤 Perfil de usuario actualizado', updatedUsuario);
        this.setUser(updatedUsuario);  // Actualiza el perfil del usuario en el BehaviorSubject
      })
    );
  }
}
