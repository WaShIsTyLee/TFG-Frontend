import { Component, Input, AfterViewInit, ViewChild, ElementRef } from "@angular/core"
import { ModalController, IonicModule } from "@ionic/angular"
import * as L from "leaflet"
import { Geolocation } from "@capacitor/geolocation"
import "leaflet-routing-machine"
import { CommonModule } from "@angular/common"

// Fix para iconos por defecto en Angular/Ionic
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

@Component({
  selector: "app-mapa-modal",
  templateUrl: "./mapa-modal.component.html",
  styleUrls: ["./mapa-modal.component.scss"],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class MapaModalComponent implements AfterViewInit {
  @Input() parking: any
  @ViewChild("mapContainer", { static: false }) mapContainer!: ElementRef

  private map!: L.Map
  isLoading = true
  userMarker: L.Marker | null = null
  parkingMarker: L.Marker | null = null
  routingControl: any = null

  constructor(private modalController: ModalController) {}

  async ngAfterViewInit() {
    if (!this.parking) {
      this.isLoading = false
      return
    }

    const { latitud, longitud, nombre } = this.parking

    this.map = L.map(this.mapContainer.nativeElement).setView([latitud, longitud], 16)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map)

    // Parking con icono por defecto rojo
    this.parkingMarker = L.marker([latitud, longitud], {
      title: nombre,
      // No icon definido: usa icono por defecto rojo
    })
      .addTo(this.map)
      .bindPopup(`
        <div style="color: #f1f5f9; font-family: 'Segoe UI', sans-serif;">
          <h3 style="margin: 0 0 5px 0; font-size: 16px;">${nombre}</h3>
          <p style="margin: 0; font-size: 14px; color: #cbd5e1;">${this.parking.ubicacion || "Ubicación no disponible"}</p>
        </div>
      `)
      .openPopup()

    try {
      const position = await Geolocation.getCurrentPosition()
      const userLat = position.coords.latitude
      const userLng = position.coords.longitude

      // Usuario con icono por defecto rojo (igual que el parking)
      this.userMarker = L.marker([userLat, userLng], {
        title: "Tu ubicación",
        // No icon definido: usa icono por defecto rojo
      })
        .addTo(this.map)
        .bindPopup("Tu ubicación actual")
        .openPopup()

      this.routingControl = (L as any).Routing.control({
        waypoints: [L.latLng(userLat, userLng), L.latLng(latitud, longitud)],
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        show: false,
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: "#667eea", opacity: 0.8, weight: 6 }],
        },
      })

      this.routingControl.addTo(this.map)

      setTimeout(() => {
        const panel = document.querySelector(".leaflet-routing-container")
        if (panel?.parentElement) {
          panel.parentElement.removeChild(panel)
        }
      }, 500)

      setTimeout(() => {
        this.map.invalidateSize()
        const bounds = L.latLngBounds([
          [userLat, userLng],
          [latitud, longitud],
        ])
        this.map.fitBounds(bounds, { padding: [50, 50] })
      }, 100)
    } catch (err) {
      console.error("Error obteniendo ubicación del usuario:", err)
    } finally {
      this.isLoading = false
    }
  }

  cerrarModal() {
    this.modalController.dismiss()
  }

  zoomIn() {
    if (this.map) {
      this.map.zoomIn()
    }
  }

  zoomOut() {
    if (this.map) {
      this.map.zoomOut()
    }
  }

  centrarMapa() {
    if (!this.map || !this.parking) return

    if (this.userMarker && this.parkingMarker) {
      const bounds = L.latLngBounds([
        this.userMarker.getLatLng(),
        this.parkingMarker.getLatLng(),
      ])
      this.map.fitBounds(bounds, { padding: [50, 50] })
    } else if (this.parkingMarker) {
      this.map.setView(this.parkingMarker.getLatLng(), 16)
    }
  }
}
