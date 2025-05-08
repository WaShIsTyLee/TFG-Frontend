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

  private apiUrl = 'http://localhost:8080/parking/parkings';
  private plazaUrl = 'http://localhost:8080/plaza/plazasDisponibles';

  constructor(private http: HttpClient) {}

  // Método para obtener todos los parkings
  getParkings(): Observable<Parking[]> {
    return this.http.get<Parking[]>(this.apiUrl);
  }

  // Método para obtener un parking específico
  getParking(id: number): Observable<Parking> {
    return this.http.get<Parking>(`${this.apiUrl}/${id}`);
  }

  // Método para obtener plazas disponibles filtradas por idParking y fechas
  getPlazasDisponibles(idParking: number, fechaInicio?: string, fechaFin?: string): Observable<Plaza[]> {
    let params: any = { idParking };

    if (fechaInicio && fechaFin) {
      params.fechaInicio = fechaInicio;
      params.fechaFin = fechaFin;
    }

    return this.http.get<Plaza[]>(this.plazaUrl, { params });
  }
}
