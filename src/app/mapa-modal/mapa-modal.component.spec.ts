import { type ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing"
import { IonicModule, ModalController } from "@ionic/angular"
import { MapaModalComponent } from "./mapa-modal.component"

describe("MapaModalComponent", () => {
  let component: MapaModalComponent
  let fixture: ComponentFixture<MapaModalComponent>
  let modalControllerSpy: jasmine.SpyObj<ModalController>

  beforeEach(waitForAsync(() => {
    // Crear spy para ModalController
    const spy = jasmine.createSpyObj("ModalController", ["dismiss"])

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        MapaModalComponent, // Importar el componente standalone directamente
      ],
      providers: [{ provide: ModalController, useValue: spy }],
    }).compileComponents()

    fixture = TestBed.createComponent(MapaModalComponent)
    component = fixture.componentInstance
    modalControllerSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>

    // Proporcionar datos de prueba para el parking
    component.parking = {
      nombre: "Parking Test",
      ubicacion: "Ubicación Test",
      latitud: 40.416775,
      longitud: -3.70379,
      plazasDisponibles: 10,
      precioHora: 2.5,
    }

    fixture.detectChanges()
  }))

  it("should create", () => {
    expect(component).toBeTruthy()
  })

  it("should call modalController.dismiss when cerrarModal is called", () => {
    component.cerrarModal()
    expect(modalControllerSpy.dismiss).toHaveBeenCalled()
  })

  it("should have parking data", () => {
    expect(component.parking).toBeDefined()
    expect(component.parking.nombre).toBe("Parking Test")
  })
})
