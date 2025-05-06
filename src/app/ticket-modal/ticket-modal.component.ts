import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-ticket-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './ticket-modal.component.html',
  styleUrls: ['./ticket-modal.component.scss'],
})
export class TicketModalComponent implements OnInit {
  @Input() reserva: any;
  duracionHoras: string = '';
  usuarioActual: any = null;

  constructor(private userService: UserService) {}

  ngOnInit() {
    // Calcular duración
    if (this.reserva?.diaEntrada && this.reserva?.diaSalida) {
      const entrada = new Date(this.reserva.diaEntrada).getTime();
      const salida = new Date(this.reserva.diaSalida).getTime();
      const duracion = (salida - entrada) / 3600000;
      this.duracionHoras = duracion.toFixed(1) + ' hrs';
    }

    // Obtener usuario logueado
    this.userService.getUser().subscribe(user => {
      console.log('👤 Usuario obtenido en TicketModalComponent:', user);
      this.usuarioActual = user;
    });
  }

  cerrar() {
    // lógica de cierre del modal
  }
}
