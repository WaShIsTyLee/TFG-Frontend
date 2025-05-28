import { Component, OnInit } from '@angular/core';
import { ParkingService } from '../services/parking.service';
import { AlertController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PlazasModalComponent } from '../plazas-modal/plazas-modal.component';
import { MapaModalComponent } from '../mapa-modal/mapa-modal.component';
import { UserService } from '../services/user.service';

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
  isAdmin: boolean = false;

  constructor(
    private parkingService: ParkingService,
    private alertController: AlertController,
    private modalController: ModalController,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadParkings();

    // Suscribirse al usuario para saber si es admin
    this.userService.getUser().subscribe(user => {
      this.isAdmin = user?.admin || false;
    });
  }

  loadParkings() {
    this.parkingService.getParkings().subscribe(
      (data) => {
        this.parkings = data;
        // Carga plazas para cada parking
        this.parkings.forEach(parking => {
          this.loadPlazasPorParking(parking.idParking);
        });
      },
      (error) => {
        console.error('Error al cargar los parkings', error);
      }
    );
  }
  async showDeletePlazasAlert(idParking: number) {
    const plazas = this.getPlazasPorParking(idParking);

    const inputs = plazas.map(plaza => ({
      name: plaza.idPlaza.toString(),
      type: 'radio' as const,   // Aquí forzamos el tipo literal correcto
      label: `Plaza: ${plaza.numeroPlaza}`,
      value: plaza.idPlaza.toString()
    }));

    const alert = await this.alertController.create({
      header: 'Selecciona una plaza para eliminar',
      inputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: (selectedIdPlaza: string) => {
            const id = Number(selectedIdPlaza);
            this.deletePlaza(id);
          }
        }
      ]
    });

    await alert.present();
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

  // Método para añadir parking solo si es admin
  async addParking() {
    const alert = await this.alertController.create({
      header: 'Añadir nuevo parking',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del parking'
        },
        {
          name: 'ubicacion',
          type: 'text',
          placeholder: 'Ubicación'
        },
        {
          name: 'latitud',
          type: 'number',
          placeholder: 'Latitud'
        },
        {
          name: 'longitud',
          type: 'number',
          placeholder: 'Longitud'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.nombre || !data.ubicacion || !data.latitud || !data.longitud) {
              this.alertMessage('Error', 'Por favor, completa todos los campos.');
              return false;  // No cierra el alert
            }

            const nuevoParking: Parking = {
              idParking: 0,
              nombre: data.nombre,
              ubicacion: data.ubicacion,
              latitud: Number(data.latitud),
              longitud: Number(data.longitud)
            };

            this.parkingService.createParking(nuevoParking).subscribe({
              next: () => {
                this.loadParkings();
              },
              error: (err) => {
                console.error('Error al crear parking', err);
                this.alertMessage('Error', 'No se pudo crear el parking.');
              }
            });

            return true;  // Cierra el alert
          }
        }
      ]
    });

    await alert.present();
  }
  async deleteParking(idParking: number) {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: '¿Deseas eliminar este parking?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.parkingService.deleteParking(idParking).subscribe({
              next: () => {
                this.loadParkings();
              },
              error: (err) => {
                console.error('Error al eliminar parking', err);
                this.alertMessage('Error', 'No se pudo eliminar el parking.');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }
  async addPlaza(idParking: number) {
    const alert = await this.alertController.create({
      header: 'Añadir nueva plaza',
      inputs: [
        {
          name: 'numeroPlaza',
          type: 'text',
          placeholder: 'Número de plaza'
        },
        {
          name: 'precioHora',
          type: 'number',
          placeholder: 'Precio por hora',
          min: 0,
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.numeroPlaza || data.precioHora === undefined || data.precioHora === null) {
              this.alertMessage('Error', 'Por favor, completa todos los campos.');
              return false; // No cierra el alert
            }

            // Aquí puedes crear el objeto plaza a enviar al backend
            const nuevaPlaza = {
              idParking: idParking,
              numeroPlaza: data.numeroPlaza,
              precioPorHora: Number(data.precioHora)
            };

            this.parkingService.createPlaza(nuevaPlaza).subscribe({
              next: () => {
                this.alertMessage('Éxito', 'Plaza añadida correctamente.');
                // Si quieres, recarga las plazas o parkings aquí
              },
              error: (err) => {
                console.error('Error al crear plaza', err);
                this.alertMessage('Error', 'No se pudo crear la plaza.');
              }
            });

            return true; // Cierra el alert
          }
        }
      ]
    });

    await alert.present();
  }
  getPlazasPorParking(idParking: number): Plaza[] {
    if (!this.plazasDisponibles) {
      return [];
    }
    return this.plazasDisponibles.filter(p => p.idParking === idParking);
  }

  loadPlazasPorParking(idParking: number) {
    this.parkingService.getPlazasByParking(idParking).subscribe(
      (plazas) => {
        // Actualizar el array general o mapear plazas al parking
        this.plazasDisponibles = this.plazasDisponibles.filter(p => p.idParking !== idParking).concat(plazas);
      },
      (error) => {
        console.error('Error al cargar plazas', error);
      }
    );
  }

  async deletePlaza(idPlaza: number) {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: '¿Deseas eliminar esta plaza?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.parkingService.deletePlaza(idPlaza).subscribe({
              next: () => {
                this.plazasDisponibles = this.plazasDisponibles.filter(p => p.idPlaza !== idPlaza);
                this.alertMessage('Éxito', 'Plaza eliminada correctamente.');
              },
              error: (err) => {
                console.error('Error al eliminar plaza', err);
                this.alertMessage('Error', 'No se pudo eliminar la plaza.');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }



}
