import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';


@Component({
  selector: 'app-parking',
  templateUrl: './parking.page.html',
  styleUrls: ['./parking.page.scss'],
  standalone: true, 
  imports: [IonicModule],  


})
export class ParkingPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
