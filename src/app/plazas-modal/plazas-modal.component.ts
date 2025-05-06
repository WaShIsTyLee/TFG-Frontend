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
      <ion-list *ngIf="plazas && plazas.length > 0; else sinPlazas">
        <ion-item *ngFor="let plaza of plazas">
          <ion-label>
            <h3>Plaza {{ plaza.numeroPlaza }}</h3>
            <p>Parking: {{ plaza.nombreParking || 'Cargando...' }}</p>
            <p>Estado: {{ plaza.estado }}</p>
            <p>Entrada: {{ fechaEntrada | date: 'dd/MM/yyyy HH:mm' }}</p>
            <p>Salida: {{ fechaSalida | date: 'dd/MM/yyyy HH:mm' }}</p>
          </ion-label>
          <ion-button slot="end" color="danger" size="small" (click)="confirmarReserva(plaza)">
            Reservar
          </ion-button>
        </ion-item>
      </ion-list>

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
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  private formatFecha(fechaStr: string): string {
    return fechaStr;
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

  async onDateChange() {
    const fechasValidas = await this.validarFechas();
    if (!fechasValidas) return;
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
            const regexMatricula = /^[A-Z0-9]{1,4}[ -]?[A-Z0-9]{1,4}$/;

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
}
