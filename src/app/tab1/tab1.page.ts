import { Component, OnInit } from '@angular/core';
import { ReservaService } from '../services/reserva.service';
import { UserService } from '../services/user.service';
import { AlertController } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { TicketModalComponent } from '../ticket-modal/ticket-modal.component';
import { take } from 'rxjs/operators';

@Component({
  imports: [CommonModule, IonicModule, FormsModule],
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  providers: [DatePipe]  
})
export class Tab1Page implements OnInit {
  reservasActivas: any[] = [];  
  reservasTotales: any[] = [];  
  private actualizandoUsuario = false; 

  constructor(
    private reservaService: ReservaService,
    private userService: UserService,
    private alertController: AlertController,
    private datePipe: DatePipe,
    private modalController: ModalController
  ) {}

  ngOnInit() {}

  // Se ejecuta cada vez que la vista está por mostrarse
  ionViewWillEnter() {
    if (!this.actualizandoUsuario) {
      this.cargarReservas(); 
    }
  }

  // Abre un modal para mostrar el ticket de una reserva
  async mostrarTicket(reserva: any) {
    const modal = await this.modalController.create({
      component: TicketModalComponent,
      componentProps: { reserva },
    });
    await modal.present();
  }

  // Carga reservas activas y totales para el usuario actual
  cargarReservas() {
    this.userService.getUser().pipe(take(1)).subscribe((user) => {
      if (user && user.id_usuario) {
        this.reservaService.getReservasActivasPorUsuarioId(user.id_usuario).subscribe({
          next: (data) => {
            this.reservasActivas = data;
          },
          error: (err) => {
            console.error('Error al obtener reservas activas:', err);
          },
        });

        this.reservaService.getReservasPorUsuarioId(user.id_usuario).subscribe({
          next: (data) => {
            this.reservasTotales = data;
          },
          error: (err) => {
            console.error('Error al obtener reservas totales:', err);
          },
        });
      }
    });
  }

  // Pregunta al usuario si desea eliminar una reserva antes de eliminarla
  async confirmarEliminar(reserva: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar reserva',
      message: `¿Estás seguro de eliminar la reserva en plaza ${reserva.plaza?.numeroPlaza}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.eliminarReserva(reserva.idReserva) },
      ],
    });
    await alert.present();
  }

  // Elimina la reserva y actualiza las listas y el usuario si es necesario
  eliminarReserva(idReserva: number) {
    this.reservaService.eliminarReserva(idReserva).subscribe(() => {
      this.reservasTotales = this.reservasTotales.filter(r => r.idReserva !== idReserva);
      this.reservasActivas = this.reservasActivas.filter(r => r.idReserva !== idReserva);

      this.actualizandoUsuario = true;

      this.userService.getUser().pipe(take(1)).subscribe(currentUser => {
        const idUsuario = currentUser?.id_usuario;
        if (idUsuario) {
          this.userService.getUserById(idUsuario).pipe(take(1)).subscribe(usuarioActualizado => {
            const esDiferente = JSON.stringify(currentUser) !== JSON.stringify(usuarioActualizado);
            if (esDiferente) {
              this.userService.setUser(usuarioActualizado);
            }
            this.actualizandoUsuario = false;
          });
        } else {
          this.actualizandoUsuario = false;
        }
      });
    });
  }

  // Formatea fechas para mostrarlas en español
  formatFecha(fecha: string | Date): string {
    return this.datePipe.transform(fecha, "d 'de' MMMM 'de' y, HH:mm", 'es-ES') || '';
  }
}
