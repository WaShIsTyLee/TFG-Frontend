import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-ticket-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, QRCodeComponent],
  templateUrl: './ticket-modal.component.html',
  styleUrls: ['./ticket-modal.component.scss'],
})
export class TicketModalComponent implements OnInit {
  @Input() reserva: any;
  duracionHoras: string = '';
  usuarioActual: any = null;
  qrData: string = ''; // ✅ propiedad bien declarada

  constructor(private userService: UserService) {}

  ngOnInit() {
    // Calcular duración
    if (this.reserva?.diaEntrada && this.reserva?.diaSalida) {
      const entrada = new Date(this.reserva.diaEntrada).getTime();
      const salida = new Date(this.reserva.diaSalida).getTime();
      const duracion = (salida - entrada) / 3600000;
      this.duracionHoras = duracion.toFixed(1) + ' hrs';
    }

    // Obtener usuario logueado y generar datos para el QR
    this.userService.getUser().subscribe(user => {
      console.log('👤 Usuario obtenido en TicketModalComponent:', user);
      this.usuarioActual = user;

      // Generar QR
      this.qrData = JSON.stringify({
        parking: this.reserva?.parking?.nombre || 'Parking',
        plaza: this.reserva?.plaza?.numeroPlaza || 'Plaza',
        entrada: this.reserva?.diaEntrada,
        salida: this.reserva?.diaSalida,
        duracion: this.duracionHoras,
        matricula: this.reserva?.matricula || 'No disponible',
        usuario: user?.name || 'Cliente'
      });
    });
  }

  cerrar() {
    // lógica de cierre del modal
  }
}
