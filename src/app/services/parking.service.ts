import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Parking {
  idParking: number;
  nombre: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
}

interface Plaza {
  idPlaza: number;
  idParking: number;
  numeroPlaza: string;
  fechaEntrada: Date | null;
  fechaSalida: Date | null;
}

@Injectable({
  providedIn: 'root'  
})
export class ParkingService {

  private baseUrl = 'http://localhost:8080';  // URL base para todas las peticiones

  constructor(private http: HttpClient) {}

  // Obtiene todos los parkings disponibles
  getParkings(): Observable<Parking[]> {
    return this.http.get<Parking[]>(`${this.baseUrl}/parking/parkings`);
  }

  // Obtiene la información de un parking específico por su ID
  getParking(id: number): Observable<Parking> {
    return this.http.get<Parking>(`${this.baseUrl}/parking/parkings/${id}`);
  }

  // Obtiene plazas disponibles en un parking, opcionalmente filtradas por fechas
  getPlazasDisponibles(idParking: number, fechaInicio?: string, fechaFin?: string): Observable<Plaza[]> {
    let params: any = { idParking };

    if (fechaInicio && fechaFin) {
      params.fechaInicio = fechaInicio;
      params.fechaFin = fechaFin;
    }

    return this.http.get<Plaza[]>(`${this.baseUrl}/plaza/plazasDisponibles`, { params });
  }

  // Crea un nuevo parking
  createParking(parking: Parking): Observable<any> {
    return this.http.post(`${this.baseUrl}/parking/create`, parking);
  }

  // Elimina un parking por ID
  deleteParking(idParking: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/parking/delete/${idParking}`);
  }

  // Crea una nueva plaza en un parking
  createPlaza(plaza: { idParking: number; numeroPlaza: string; precioPorHora: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/parking/plaza/create`, plaza);
  }

  // Elimina una plaza por su ID
  deletePlaza(idPlaza: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/plaza/delete/${idPlaza}`, { responseType: 'text' });
  }

  // Obtiene todas las plazas de un parking específico
  getPlazasByParking(idParking: number): Observable<Plaza[]> {
    return this.http.get<Plaza[]>(`${this.baseUrl}/plaza/porParking/${idParking}`);
  }
}
