import { Component, OnInit } from '@angular/core';
import { ParkingService } from '../services/parking.service';
import { AlertController, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PlazasModalComponent } from '../plazas-modal/plazas-modal.component';
import { MapaModalComponent } from '../mapa-modal/mapa-modal.component';
import { UserService } from '../services/user.service';

// Definición de interfaces para tipar objetos de parking y plazas
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
  selector: 'app-tab2',              // Selector para usar este componente en HTML
  templateUrl: 'tab2.page.html',    // Plantilla HTML asociada
  styleUrls: ['tab2.page.scss'],    // Estilos CSS/SASS asociados
  standalone: true,                 // Componente independiente (Angular v14+)
  imports: [CommonModule, IonicModule],  // Importa módulos necesarios para la plantilla
})
export class Tab2Page implements OnInit {

  // Variables para almacenar parkings y plazas
  parkings: Parking[] = [];              // Todos los parkings
  parkingsCercanos: Parking[] = [];     // Parkings cerca del usuario
  plazasDisponibles: Plaza[] = [];       // Plazas disponibles para cada parking
  isAdmin: boolean = false;               // Estado para saber si el usuario es admin

  constructor(
    private parkingService: ParkingService,  // Servicio para operaciones de parkings/plazas
    private alertController: AlertController,  // Controlador para mostrar alertas modales
    private modalController: ModalController,  // Controlador para modales personalizados
    private userService: UserService           // Servicio para obtener datos del usuario
  ) { }

  ngOnInit() {
    // Al iniciar el componente:
    this.loadParkingsCercanos(100);   // Carga parkings cercanos dentro de 100 km (valor por defecto)
    this.loadParkings();               // Carga todos los parkings

    // Comprueba si el usuario es admin para mostrar opciones adicionales
    this.userService.getUser().subscribe(user => {
      this.isAdmin = user?.admin || false;
    });
  }

  // Método para obtener la ubicación actual del usuario usando geolocalización del navegador
  getUserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocalización no soportada por el navegador');
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  }

  // Calcula la distancia en kilómetros entre dos coordenadas geográficas (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (x: number) => x * Math.PI / 180;

    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Carga parkings que estén dentro de un radio (en km) desde la ubicación actual del usuario
  async loadParkingsCercanos(radioKm: number = 5) {
    try {
      const position = await this.getUserLocation();
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      this.parkingService.getParkings().subscribe(data => {
        // Filtra los parkings según la distancia calculada
        this.parkingsCercanos = data.filter(parking => {
          const dist = this.calculateDistance(userLat, userLon, parking.latitud, parking.longitud);
          return dist <= radioKm;
        });
        // Carga plazas para cada parking cercano
        this.parkingsCercanos.forEach(p => this.loadPlazasPorParking(p.idParking));
      });
    } catch (error) {
      console.error('No se pudo obtener la ubicación:', error);
      this.parkingsCercanos = [];
    }
  }

  // Carga todos los parkings y sus plazas
  loadParkings() {
    this.parkingService.getParkings().subscribe(
      (data) => {
        this.parkings = data;
        this.parkings.forEach(parking => {
          this.loadPlazasPorParking(parking.idParking);
        });
      },
      (error) => {
        console.error('Error al cargar los parkings', error);
      }
    );
  }

  // Muestra un alert para seleccionar una plaza y eliminarla (sólo admins)
  async showDeletePlazasAlert(idParking: number) {
    const plazas = this.getPlazasPorParking(idParking);

    // Crea inputs de tipo radio para cada plaza
    const inputs = plazas.map(plaza => ({
      name: plaza.idPlaza.toString(),
      type: 'radio' as const,
      label: `Plaza: ${plaza.numeroPlaza}`,
      value: plaza.idPlaza.toString()
    }));

    const alert = await this.alertController.create({
      header: 'Selecciona una plaza para eliminar',
      inputs,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
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

  // Abre un modal que muestra el mapa con la ubicación del parking seleccionado
  async openMapaModal(parking: Parking) {
    const modal = await this.modalController.create({
      component: MapaModalComponent,
      componentProps: { parking }
    });

    await modal.present();
  }

  // Abre un alert para seleccionar fechas y buscar plazas disponibles en un parking
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
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Buscar',
          handler: async (data) => {
            const fechaInicio = new Date(data.fechaInicio);
            const fechaFin = new Date(data.fechaFin);
            const ahora = new Date();

            // Validaciones de fechas
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

            // Llama al servicio para obtener plazas disponibles en el rango de fechas
            this.parkingService.getPlazasDisponibles(idParking, data.fechaInicio, data.fechaFin).subscribe(
              (plazas) => {
                if (!plazas || plazas.length === 0) {
                  this.presentAlert();
                  return;
                }

                // Abre modal mostrando plazas disponibles
                this.openPlazasModal(plazas, data.fechaInicio, data.fechaFin);
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

  // Abre modal con las plazas disponibles y fechas seleccionadas
  async openPlazasModal(plazas: Plaza[], fechaEntrada: string, fechaSalida: string) {
    const modal = await this.modalController.create({
      component: PlazasModalComponent,
      componentProps: { plazas, fechaEntrada, fechaSalida }
    });

    await modal.present();
  }

  // Muestra alerta genérica cuando no hay plazas disponibles
  async presentAlert() {
    await this.alertMessage('Sin plazas disponibles', 'No hay plazas disponibles en este parking.');
  }

  // Método auxiliar para mostrar alertas con título y mensaje personalizados
  private async alertMessage(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  // Añade un nuevo parking mediante un formulario de alertas
  async addParking() {
    const alert = await this.alertController.create({
      header: 'Añadir nuevo parking',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre del parking' },
        { name: 'ubicacion', type: 'text', placeholder: 'Ubicación' },
        { name: 'latitud', type: 'number', placeholder: 'Latitud' },
        { name: 'longitud', type: 'number', placeholder: 'Longitud' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.nombre || !data.ubicacion || !data.latitud || !data.longitud) {
              this.alertMessage('Error', 'Por favor, completa todos los campos.');
              return false;
            }

            // Crea objeto parking con datos ingresados
            const nuevoParking: Parking = {
              idParking: 0,  // El ID se asignará en backend
              nombre: data.nombre,
              ubicacion: data.ubicacion,
              latitud: Number(data.latitud),
              longitud: Number(data.longitud)
            };

            // Llama al servicio para crear parking y recarga la lista al completar
            this.parkingService.createParking(nuevoParking).subscribe({
              next: () => {
                this.loadParkings();
              },
              error: (err) => {
                console.error('Error al crear parking', err);
                this.alertMessage('Error', 'No se pudo crear el parking.');
              }
            });

            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  // Elimina un parking tras confirmar la acción con el usuario
  async deleteParking(idParking: number) {
    const alert = await this.alertController.create({
      header: '¿Estás seguro?',
      message: '¿Deseas eliminar este parking?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.parkingService.deleteParking(idParking).subscribe({
              next: () => {
                this.loadParkings();  // Refresca la lista tras eliminación
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

  // Añade una nueva plaza en un parking específico
  async addPlaza(idParking: number) {
    const alert = await this.alertController.create({
      header: 'Añadir nueva plaza',
      inputs: [
        { name: 'numeroPlaza', type: 'text', placeholder: 'Número de plaza' },
        { name: 'precioHora', type: 'number', placeholder: 'Precio por hora', min: 0 }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (!data.numeroPlaza || data.precioHora === undefined || data.precioHora === null) {
              this.alertMessage('Error', 'Por favor, completa todos los campos.');
              return false;
            }

            // Crea objeto plaza con datos ingresados
            const nuevaPlaza = {
              idParking: idParking,
              numeroPlaza: data.numeroPlaza,
              precioPorHora: Number(data.precioHora)
            };

            // Llama al servicio para crear plaza
            this.parkingService.createPlaza(nuevaPlaza).subscribe({
              next: () => {
                this.alertMessage('Éxito', 'Plaza añadida correctamente.');
              },
              error: (err) => {
                console.error('Error al crear plaza', err);
                this.alertMessage('Error', 'No se pudo crear la plaza.');
              }
            });

            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  // Devuelve las plazas filtradas por parking
  getPlazasPorParking(idParking: number): Plaza[] {
    if (!this.plazasDisponibles) {
      return [];
    }
    return this.plazasDisponibles.filter(p => p.idParking === idParking);
  }

  // Carga las plazas disponibles para un parking y actualiza la lista general
  loadPlazasPorParking(idParking: number) {
    this.parkingService.getPlazasByParking(idParking).subscribe(
      (plazas) => {
        // Actualiza plazas disponibles, eliminando las anteriores de ese parking y agregando las nuevas
        this.plazasDisponibles = this.plazasDisponibles.filter(p => p.idParking !== idParking).concat(plazas);
      },
      (error) => {
        console.error('Error al cargar plazas', error);
      }
    );
  }

  // Elimina una plaza tras confirmar la acción
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
                // Actualiza lista eliminando la plaza borrada
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
