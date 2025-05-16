import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FlightService {

  private headers = new HttpHeaders({
    'X-RapidAPI-Key': '7dc6b5e88fmshb1dae10602815f5p1187a1jsnb4baaef40b85',
    'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
  });

  constructor(private http: HttpClient) {}

 getDepartures(airportCode: string) {
  const now = new Date();
  const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000); // suma 12 horas

  // Formatea a YYYY-MM-DDTHH:mm
  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  const from = formatDate(now);
  const to = formatDate(twelveHoursLater);

  const apiUrl = `https://aerodatabox.p.rapidapi.com/flights/airports/icao/${airportCode}/${from}/${to}`;
  return this.http.get(apiUrl, { headers: this.headers });
}


}
