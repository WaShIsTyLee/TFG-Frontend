import { Component } from '@angular/core';
import { UserService } from '../services/user.service'; // ajusta el path si es diferente
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular'; // ✅ importa esto

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule] // ✅ agrega esto aquí
})
export class Tab3Page {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  logout() {
    this.userService.logOut();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
