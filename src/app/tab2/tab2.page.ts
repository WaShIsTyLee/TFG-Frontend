import { Component, OnInit } from '@angular/core';
import { ParkingService } from '../services/parking.service';
import { AlertController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PlazasModalComponent } from '../plazas-modal/plazas-modal.component';
import { MapaModalComponent } from '../mapa-modal/mapa-modal.component';

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
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
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

  loadParkings() {
    this.parkingService.getParkings().subscribe(
      (data) => {
        this.parkings = data;
      },
      (error) => {
        console.error('Error al cargar los parkings', error);
      }
    );
  }

  async openMapaModal(parking: Parking) {
    const modal = await this.modalController.create({
      component: MapaModalComponent,
      componentProps: { parking }
    });

    await modal.present();
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
