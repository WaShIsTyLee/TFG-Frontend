import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Taxi {
  idTaxi: number;
  matricula: string;
  capacidad: number;
  telefono: string;
  adaptado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TaxiService {

  private baseUrl = 'http://localhost:8080/taxis'; // cambia el puerto si es necesario

  constructor(private http: HttpClient) {}

  getTaxisAdaptados(): Observable<Taxi[]> {
    return this.http.get<Taxi[]>(`${this.baseUrl}/getTaxisAdaptados`);
  }

  getTaxisNoAdaptados(): Observable<Taxi[]> {
    return this.http.get<Taxi[]>(`${this.baseUrl}/getTaxisNoAdaptados`);
  }
  getTaxisByCiudad(ciudad: string): Observable<Taxi[]> {
    return this.http.get<Taxi[]>(`${this.baseUrl}/getTaxisByCiudad?ciudad=${ciudad}`);
  }
}
