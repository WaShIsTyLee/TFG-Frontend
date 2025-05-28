import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/usuario';  
  private userSubject = new BehaviorSubject<any>(null);  

  constructor(private http: HttpClient) { }

  setUser(user: any) {
    // Asignar admin = true si el email termina con @admin.com
    const isAdmin = user?.email?.toLowerCase().endsWith('@admin.com'); 
    user.admin = isAdmin;
    console.log('💾 Guardando usuario en UserService:', user);
    this.userSubject.next(user);
  }

  getUser(): Observable<any> {
    return this.userSubject.asObservable();
  }

  logOut() {
    this.userSubject.next(null);
  }
  
  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/getById/${id}`);
  }

  updatePerfil(usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updatePerfil`, usuario).pipe(
      tap(updatedUsuario => {
        console.log('👤 Perfil de usuario actualizado', updatedUsuario);
        this.setUser(updatedUsuario);
      })
    );
  }
}
