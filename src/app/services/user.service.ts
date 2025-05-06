  import { Injectable } from '@angular/core';
  import { BehaviorSubject, Observable } from 'rxjs';

  @Injectable({
    providedIn: 'root'
  })
  export class UserService {
    private userSubject = new BehaviorSubject<any>(null);  // Inicializa con null

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
  }
