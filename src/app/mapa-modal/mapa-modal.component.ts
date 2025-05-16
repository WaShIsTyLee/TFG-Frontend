import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import 'leaflet-routing-machine';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mapa-modal',
  templateUrl: './mapa-modal.component.html',
  styleUrls: ['./mapa-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class MapaModalComponent implements AfterViewInit {

  @Input() parking: any;
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private map!: L.Map;

  constructor(private modalController: ModalController) {}

  async ngAfterViewInit() {
    if (!this.parking) return;

    const { latitud, longitud, nombre } = this.parking;

    this.map = L.map(this.mapContainer.nativeElement).setView([latitud, longitud], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // Icono del parking
    const parkingIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    L.marker([latitud, longitud], { icon: parkingIcon })
      .addTo(this.map)
      .bindPopup(nombre)
      .openPopup();

    try {
      const position = await Geolocation.getCurrentPosition();
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      const userIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconSize: [30, 46],
        iconAnchor: [15, 46],
        popupAnchor: [0, -40],
      });

      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(this.map)
        .bindPopup('Tu ubicación')
        .openPopup();

      const routingControl = (L as any).Routing.control({
        waypoints: [
          L.latLng(userLat, userLng),
          L.latLng(latitud, longitud)
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
        createMarker: () => null
      });

      routingControl.addTo(this.map);

      // Oculta el panel de instrucciones si aparece
      setTimeout(() => {
        const panel = document.querySelector('.leaflet-routing-container');
        if (panel?.parentElement) {
          panel.parentElement.removeChild(panel);
        }
      }, 500);

      setTimeout(() => this.map.invalidateSize(), 100);

    } catch (err) {
      console.error('Error obteniendo ubicación del usuario:', err);
    }
  }

  cerrarModal() {
    this.modalController.dismiss();
  }
}
