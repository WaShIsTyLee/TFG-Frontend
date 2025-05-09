import { Component, OnInit } from '@angular/core';
import { ParkingService } from '../services/parking.service';
import { AlertController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PlazasModalComponent } from '../plazas-modal/plazas-modal.component';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import 'leaflet-routing-machine';



// Definir las interfaces para Parking y Plaza
interface Parking {
  idParking: number;
  nombre: string;
  ubicacion: string;
  latitud: number;
  longitud: number;
  isMapaVisible: boolean;
}

interface Plaza {
  idPlaza: number;
  idParking: number;
  numeroPlaza: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [CommonModule, IonicModule],
})
export class Tab2Page implements OnInit {

  parkings: Parking[] = [];
  plazasDisponibles: Plaza[] = [];

  constructor(
    private parkingService: ParkingService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadParkings();
  }

  toggleMapa(parking: Parking) {
    parking.isMapaVisible = !parking.isMapaVisible;

    if (parking.isMapaVisible) {
      // Inicializamos el mapa con delay para asegurar que el DOM ya está renderizado
      setTimeout(() => this.initMap(parking), 100);
    }
  }

  initMap(parking: Parking) {
    const mapId = `mapa-${parking.idParking}`;
    setTimeout(() => {
      const mapElement = document.getElementById(mapId);
      if (!mapElement) return;
  
      const map = L.map(mapElement).setView([parking.latitud, parking.longitud], 16);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
  
      const parkingIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
  
      L.marker([parking.latitud, parking.longitud], { icon: parkingIcon })
        .addTo(map)
        .bindPopup(parking.nombre)
        .openPopup();
  
      Geolocation.getCurrentPosition().then(position => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
  
        const userIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          iconSize: [30, 46],
          iconAnchor: [15, 46],
          popupAnchor: [0, -40],
        });
  
        L.marker([userLat, userLng], { icon: userIcon })
          .addTo(map)
          .bindPopup('Tu ubicación')
          .openPopup();
  
        // Agregar ruta sin mostrar el panel de instrucciones y sin marcadores automáticos
        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(userLat, userLng),
            L.latLng(parking.latitud, parking.longitud)
          ],
          routeWhileDragging: false,
          addWaypoints: false,
          fitSelectedRoutes: true,
          show: false,
          createMarker: () => null // Este campo no está tipado oficialmente, así que forzamos el tipo
        } as any); // ← ← ← solución al error de TypeScript
  
        routingControl.addTo(map);
  
        // Eliminar el contenedor de instrucciones si aparece
        setTimeout(() => {
          const panel = document.querySelector('.leaflet-routing-container');
          if (panel && panel.parentElement) {
            panel.parentElement.removeChild(panel);
          }
        }, 500);
  
      }).catch(err => {
        console.error('Error al obtener la ubicación del usuario', err);
      });
  
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }, 0);
  }
  

  

  loadParkings() {
    this.parkingService.getParkings().subscribe(
      (data) => {
        this.parkings = data.map((parking) => ({
          ...parking,
          isMapaVisible: false,
        }));
      },
      (error) => {
        console.error('Error al cargar los parkings', error);
      }
    );
  }

  reservarPlaza(plaza: any) {
    console.log("Reservando plaza:", plaza);
  }

  async loadPlazas(idParking: number) {
    const alert = await this.alertController.create({
      header: 'Selecciona fechas',
      inputs: [
        {
          name: 'fechaInicio',
          type: 'datetime-local',
          label: 'Fecha y hora de entrada',
        },
        {
          name: 'fechaFin',
          type: 'datetime-local',
          label: 'Fecha y hora de salida',
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Buscar',
          handler: async (data) => {
            const fechaInicio = new Date(data.fechaInicio);
            const fechaFin = new Date(data.fechaFin);
            const ahora = new Date();

            if (!data.fechaInicio || !data.fechaFin) {
              await this.alertMessage('Fechas requeridas', 'Debes seleccionar ambas fechas.');
              return false;
            }

            if (fechaInicio < ahora) {
              await this.alertMessage('Fecha inválida', 'La fecha de entrada no puede ser anterior al día de hoy.');
              return false;
            }

            if (fechaInicio >= fechaFin) {
              await this.alertMessage('Fechas inválidas', 'La fecha de entrada debe ser anterior a la de salida.');
              return false;
            }

            const fechaInicioISO = data.fechaInicio;
            const fechaFinISO = data.fechaFin;

            this.parkingService.getPlazasDisponibles(idParking, fechaInicioISO, fechaFinISO).subscribe(
              (plazas) => {
                if (!plazas || plazas.length === 0) {
                  this.presentAlert();
                  return;
                }

                this.openPlazasModal(plazas, fechaInicioISO, fechaFinISO);
              },
              (error) => {
                console.error('Error al cargar las plazas disponibles', error);
              }
            );

            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async openPlazasModal(plazas: Plaza[], fechaEntrada: string, fechaSalida: string) {
    const modal = await this.modalController.create({
      component: PlazasModalComponent,
      componentProps: { plazas, fechaEntrada, fechaSalida }
    });

    await modal.present();
  }

  async presentAlert() {
    await this.alertMessage('Sin plazas disponibles', 'No hay plazas disponibles en este parking.');
  }

  private async alertMessage(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
