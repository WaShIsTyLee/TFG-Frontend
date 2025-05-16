import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private apiBase = 'http://localhost:8080/api/reservas'; // Base general del controlador

  constructor(private http: HttpClient) { }

  // Crear una nueva reserva
  crearReserva(reserva: any): Observable<any> {
    return this.http.post(`${this.apiBase}/reservar`, reserva);
  }

  // Obtener reservas por ID de usuario
  getReservasPorUsuarioId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/usuario/${id}`);
  }
  getReservasActivasPorUsuarioId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/activas/${id}`);
  }
  eliminarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/${id}`);
  }
  
}
