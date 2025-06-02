import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root' // Servicio disponible en toda la aplicación
})
export class FlightService {

  // Cabeceras necesarias para autenticarse con la API externa de AerodataBox
  private headers = new HttpHeaders({
    'X-RapidAPI-Key': '7dc6b5e88fmshb1dae10602815f5p1187a1jsnb4baaef40b85',
    'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
  });

  constructor(private http: HttpClient) {}

  // Método para obtener los vuelos de salida (departures) desde un aeropuerto dado
  getDepartures(airportCode: string) {
    const now = new Date();
    const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000); // Calcula la hora actual + 12 horas

    // Función auxiliar para formatear fechas en formato ISO (YYYY-MM-DDTHH:mm)
    const formatDate = (date: Date): string => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${d}T${h}:${min}`;
    };

    // Obtiene las fechas formateadas para el rango de consulta
    const from = formatDate(now);
    const to = formatDate(twelveHoursLater);

    // Construye la URL de la API con el código del aeropuerto y el rango horario
    const apiUrl = `https://aerodatabox.p.rapidapi.com/flights/airports/icao/${airportCode}/${from}/${to}`;
    
    // Realiza la petición GET con los headers para obtener los vuelos
    return this.http.get(apiUrl, { headers: this.headers });
  }
}
