import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaz que define la estructura de un Taxi
export interface Taxi {
  idTaxi: number;
  matricula: string;
  capacidad: number;
  telefono: string;
  adaptado: boolean;
}

@Injectable({
  providedIn: 'root' // El servicio está disponible en toda la aplicación
})
export class TaxiService {

  // URL base para las peticiones relacionadas con taxis
  private baseUrl = 'http://localhost:8080/taxis'; // Cambiar el puerto si es necesario

  constructor(private http: HttpClient) {}

  // Obtiene todos los taxis adaptados (por ejemplo, accesibles para personas con discapacidad)
  getTaxisAdaptados(): Observable<Taxi[]> {
    return this.http.get<Taxi[]>(`${this.baseUrl}/getTaxisAdaptados`);
  }

  // Obtiene todos los taxis no adaptados
  getTaxisNoAdaptados(): Observable<Taxi[]> {
    return this.http.get<Taxi[]>(`${this.baseUrl}/getTaxisNoAdaptados`);
  }

  // Obtiene taxis filtrados por ciudad, usando un parámetro de consulta (query param)
  getTaxisByCiudad(ciudad: string): Observable<Taxi[]> {
    return this.http.get<Taxi[]>(`${this.baseUrl}/getTaxisByCiudad?ciudad=${ciudad}`);
  }
}
