import { Component, OnInit } from '@angular/core';
import { ParkingService } from '../services/parking.service';
import { AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { PlazasModalComponent } from '../plazas-modal/plazas-modal.component';


interface Parking {
  idParking: number;
  nombre: string;
  ubicacion: string;
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
              await this.alertController.create({
                header: 'Fechas requeridas',
                message: 'Debes seleccionar ambas fechas.',
                buttons: ['OK']
              }).then(a => a.present());
              return false;
            }
  
            if (fechaInicio < ahora) {
              await this.alertController.create({
                header: 'Fecha inválida',
                message: 'La fecha de entrada no puede ser anterior al día de hoy.',
                buttons: ['OK']
              }).then(a => a.present());
              return false;
            }
  
            if (fechaInicio >= fechaFin) {
              await this.alertController.create({
                header: 'Fechas inválidas',
                message: 'La fecha de entrada debe ser anterior a la de salida.',
                buttons: ['OK']
              }).then(a => a.present());
              return false;
            }
  
            // Si las fechas son válidas, buscamos las plazas
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
    const alert = await this.alertController.create({
      header: 'Sin plazas disponibles',
      message: 'No hay plazas disponibles en este parking.',
      buttons: ['OK']
    });

    await alert.present();
  }
}
