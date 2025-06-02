import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  // Define que este servicio está disponible en toda la aplicación
})
export class ReservaService {

  // URL base para las llamadas relacionadas con reservas en la API
  private apiBase = 'http://localhost:8080/api/reservas';

  constructor(private http: HttpClient) { }

  // Método para crear una nueva reserva enviando los datos al backend
  crearReserva(reserva: any): Observable<any> {
    return this.http.post(`${this.apiBase}/reservar`, reserva);
  }

  // Obtiene todas las reservas asociadas a un usuario por su ID
  getReservasPorUsuarioId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/usuario/${id}`);
  }

  // Obtiene las reservas activas de un usuario, filtrando por su ID
  getReservasActivasPorUsuarioId(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/activas/${id}`);
  }

  // Elimina una reserva específica identificada por su ID
  eliminarReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/${id}`);
  }
  
}
