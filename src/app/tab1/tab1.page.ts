import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../services/reserva.service';
import { UserService } from '../services/user.service';
import { AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, IonicModule, FormsModule],
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  reservasActivas: any[] = [];
  reservasTotales: any[] = [];

  constructor(
    private reservaService: ReservaService,
    private userService: UserService,
    private alertController: AlertController
  ) {}

  ngOnInit() {}

  ionViewWillEnter() {
    this.cargarReservas();
  }

  cargarReservas() {
    this.userService.getUser().subscribe((user) => {
      if (user && user.id_usuario) {
        // Obtener reservas activas
        this.reservaService.getReservasActivasPorUsuarioId(user.id_usuario).subscribe({
          next: (data) => {
            console.log('📦 Reservas activas obtenidas:', data);
            this.reservasActivas = data;
          },
          error: (err) => {
            console.error('❌ Error al obtener reservas activas:', err);
          },
        });

        // Obtener reservas totales
        this.reservaService.getReservasPorUsuarioId(user.id_usuario).subscribe({
          next: (data) => {
            console.log('📦 Reservas totales obtenidas:', data);
            this.reservasTotales = data;
          },
          error: (err) => {
            console.error('❌ Error al obtener reservas totales:', err);
          },
        });
      }
    });
  }

  async confirmarEliminar(reserva: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar reserva',
      message: `¿Estás seguro de eliminar la reserva en plaza ${reserva.plaza?.numeroPlaza}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarReserva(reserva.idReserva);
          },
        },
      ],
    });

    await alert.present();
  }

  eliminarReserva(idReserva: number) {
    this.reservaService.eliminarReserva(idReserva).subscribe(() => {
      this.reservasTotales = this.reservasTotales.filter((r) => r.idReserva !== idReserva);
      this.reservasActivas = this.reservasActivas.filter((r) => r.idReserva !== idReserva);
    });
  }
}
