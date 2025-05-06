import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ReservaService } from '../services/reserva.service';
import { UserService } from '../services/user.service';
import { ParkingService } from '../services/parking.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  imports: [IonicModule, CommonModule, FormsModule],
  selector: 'app-plazas-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Plazas Disponibles</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrarModal()">Cerrar</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div *ngIf="plazas && plazas.length > 0; else sinPlazas" class="parking-grid">
        <div class="row" *ngFor="let row of filas">
          <div *ngFor="let plaza of row" class="plaza disponible" (click)="confirmarReserva(plaza)">
            <span>{{ plaza.numeroPlaza }}</span>
          </div>
        </div>
      </div>

      <ng-template #sinPlazas>
        <ion-text color="medium">
          <p class="ion-padding">No hay plazas disponibles.</p>
        </ion-text>
      </ng-template>
    </ion-content>
  `,
  styleUrls: ['./plazas-modal.component.scss']
})
export class PlazasModalComponent implements OnInit {
  @Input() plazas: any[] = [];
  @Input() fechaEntrada!: string;
  @Input() fechaSalida!: string;

  idUsuario!: number;
  filas: any[] = []; // Para organizar las plazas en filas y columnas.

  constructor(
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private reservaService: ReservaService,
    private parkingService: ParkingService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.userService.getUser().subscribe(user => {
      if (user) {
        this.idUsuario = user.id_usuario;
      }
    });

    this.plazas.forEach(plaza => {
      this.parkingService.getParking(plaza.idParking).subscribe(parking => {
        plaza.nombreParking = parking.nombre;
      });
    });

    this.organizarPlazas();
  }

  organizarPlazas() {
    const plazasPorFila = 5; // Número de plazas por fila
    this.filas = [];

    // Organiza las plazas en filas
    let filaActual: any[] = [];
    this.plazas.forEach((plaza, index) => {
      filaActual.push(plaza);
      if (filaActual.length === plazasPorFila) {
        this.filas.push(filaActual);
        filaActual = [];
      }
    });

    // Si quedan plazas sin llenar una fila completa, agrega la última fila
    if (filaActual.length > 0) {
      this.filas.push(filaActual);
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async confirmarReserva(plaza: any) {
    if (!this.idUsuario) {
      await this.mostrarAlerta('Error', 'Usuario no logueado.');
      return;
    }

    const fechasValidas = await this.validarFechas();
    if (!fechasValidas) return;

    const alert = await this.alertController.create({
      header: 'Introduce la matrícula',
      inputs: [
        {
          name: 'matricula',
          type: 'text',
          placeholder: 'Ej: 1234-BCD'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async (data) => {
            const matricula = data.matricula?.trim().toUpperCase();
            const regexMatricula = /^([A-Z0-9]{1,7})([ -]?[A-Z0-9]{1,7})?$/; // Expresión regular para validar matrícula

            if (!matricula) {
              await this.mostrarAlerta('Campo requerido', 'Debes introducir una matrícula.');
              return false;
            }

            if (!regexMatricula.test(matricula)) {
              await this.mostrarAlerta('Matrícula inválida', 'Introduce una matrícula válida en formato 1234-BCD (sin vocales).');
              return false;
            }

            const reserva = {
              idUsuario: this.idUsuario,
              idParking: plaza.idParking,
              idPlaza: plaza.idPlaza,
              diaEntrada: this.fechaEntrada,
              diaSalida: this.fechaSalida,
              matricula: matricula
            };

            console.log("Reserva a enviar: ", reserva);

            this.reservaService.crearReserva(reserva).subscribe(
              (response) => {
                console.log('Reserva creada exitosamente:', response);
                this.modalCtrl.dismiss({ reservado: true, plaza });
              },
              async (error) => {
                console.error('Error al crear la reserva:', error);
                if (error.status === 409) {
                  await this.mostrarAlerta('Matrícula ya registrada', 'Ya tienes una reserva activa con esa matrícula.');
                } else {
                  await this.mostrarAlerta('Error al reservar', 'Ocurrió un error al intentar crear la reserva.');
                }
                this.modalCtrl.dismiss({ reservado: false, plaza });
              }
            );

            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private async mostrarAlerta(titulo: string, mensaje: string) {
    const errorAlert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await errorAlert.present();
  }

  async validarFechas() {
    const hoy = new Date();
    const fechaEntrada = new Date(this.fechaEntrada);
    const fechaSalida = new Date(this.fechaSalida);

    if (fechaEntrada < hoy) {
      await this.mostrarAlerta('Fecha inválida', 'La fecha de entrada no puede ser anterior al día de hoy.');
      return false;
    }

    if (fechaEntrada >= fechaSalida) {
      await this.mostrarAlerta('Fechas inválidas', 'La fecha de entrada debe ser anterior a la de salida.');
      return false;
    }

    return true;
  }
}
