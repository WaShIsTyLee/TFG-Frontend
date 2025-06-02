import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { IonicModule } from '@ionic/angular';
import { TaxiService, Taxi } from '../services/taxi.service'; 

@Component({
  imports: [
    CommonModule, FormsModule, IonicModule
  ],
  selector: 'app-tab5',
  templateUrl: './tab5.page.html',
  styleUrls: ['./tab5.page.scss'],
})
export class Tab5Page implements OnInit {

  taxisAdaptados: Taxi[] = [];
  taxisNoAdaptados: Taxi[] = [];
  ciudadSeleccionada: string = ''; 
  ciudades: string[] = ['Madrid', 'Málaga', 'Bilbao','Alicante','Valencia','Barcelona','Mallorca']; 

  constructor(private taxiService: TaxiService) {}

  ngOnInit() {
    this.cargarTaxis(); 
  }

  // Método para cargar los taxis según la ciudad seleccionada
  cargarTaxis() {
    if (this.ciudadSeleccionada) {
      this.taxiService.getTaxisByCiudad(this.ciudadSeleccionada).subscribe(data => {
        this.taxisAdaptados = data.filter(taxi => taxi.adaptado);
        this.taxisNoAdaptados = data.filter(taxi => !taxi.adaptado);
      });
    } else {
      this.taxiService.getTaxisAdaptados().subscribe(data => {
        this.taxisAdaptados = data;
      });

      this.taxiService.getTaxisNoAdaptados().subscribe(data => {
        this.taxisNoAdaptados = data;
      });
    }
  }

  // Método para manejar el cambio en el selector de ciudad
  onCiudadChange() {
    this.cargarTaxis(); 
  }

  llamarTaxi(telefono: string) {
    window.open(`tel:${telefono}`, '_system'); 
  }
}
