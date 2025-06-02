import { Component, OnInit } from '@angular/core';
import { FlightService } from '../services/flight.service';  
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule],  
})
export class Tab4Page implements OnInit {

  departures: any[] = [];           
  filteredDepartures: any[] = [];   
  searchDestination = '';           
  searchFlightNumber = '';          
  selectedAirport: string = 'LEMD'; 
  selectedAirportName: string = 'Madrid'; 
  selectedStatus: string = '';      

  // Lista de aeropuertos disponibles para seleccionar
  airports = [
    { name: 'Madrid', code: 'LEMD' },
    { name: 'Barcelona', code: 'LEBL' },
    { name: 'Málaga', code: 'LEMG' },
    { name: 'Valencia', code: 'LEVC' },
    { name: 'Alicante', code: 'LEAL' },
    { name: 'Mallorca', code: 'LEPA' },
    { name: 'Bilbao', code: 'LEBB' }
  ];

  // Estados de vuelo posibles
  flightStatuses: string[] = [
    'Unknown', 'Expected', 'EnRoute', 'CheckIn', 'Boarding',
    'GateClosed', 'Departed', 'Delayed', 'Approaching', 'Arrived',
    'Canceled', 'Diverted', 'CanceledUncertain'
  ];

  // Traducciones para mostrar en la UI en español
  statusTranslations: { [key: string]: string } = {
    'Unknown': 'Desconocido',
    'Expected': 'Previsto',
    'EnRoute': 'En ruta',
    'CheckIn': 'Facturación abierta',
    'Boarding': 'Embarque en curso',
    'GateClosed': 'Puerta cerrada',
    'Departed': 'Despegado',
    'Delayed': 'Retrasado',
    'Approaching': 'En aproximación',
    'Arrived': 'Aterrizado',
    'Canceled': 'Cancelado',
    'Diverted': 'Desviado',
    'CanceledUncertain': 'Probablemente cancelado'
  };

  constructor(private flightService: FlightService) {}

  ngOnInit() {
    this.loadDepartures();
  }

  // Función para traducir el estado del vuelo para mostrarlo
  translateStatus(status: string): string {
    return this.statusTranslations[status] || status || 'Sin estado';
  }

  // Carga los vuelos desde el servicio, filtrando por aeropuerto seleccionado
  loadDepartures() {
    this.flightService.getDepartures(this.selectedAirport).subscribe({
      next: (data: any) => {
        this.departures = data.departures || []; 
        this.filteredDepartures = this.departures; 
        this.filterFlights();  
      },
      error: (err) => {
        console.error('Error al obtener vuelos:', err);
      }
    });
  }

  // Aplica los filtros definidos (destino, número de vuelo, estado)
  filterFlights() {
    this.filteredDepartures = this.departures.filter(flight => {
      const matchDestination = this.searchDestination ?
        flight.movement?.airport?.name?.toLowerCase().includes(this.searchDestination.toLowerCase()) : true;

      const matchFlightNumber = this.searchFlightNumber ?
        flight.number?.toLowerCase().includes(this.searchFlightNumber.toLowerCase()) : true;

      const matchStatus = this.selectedStatus ?
        flight.status === this.selectedStatus : true;

      return matchDestination && matchFlightNumber && matchStatus;
    });
  }

  // Cuando cambia el aeropuerto seleccionado, actualiza el nombre y carga vuelos
  onAirportChange() {
    const airport = this.airports.find(a => a.code === this.selectedAirport);
    if (airport) {
      this.selectedAirportName = airport.name;
    }
    this.loadDepartures();
  }
}
