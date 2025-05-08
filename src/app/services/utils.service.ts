import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor() {}

  async takePicture(promptLabelHeader: string) {
    try {
      // Usamos el plugin de cámara de Capacitor para capturar una imagen
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl, // Queremos la imagen en formato base64
        source: CameraSource.Prompt, // Permite al usuario elegir entre cámara o galería
        promptLabelHeader: promptLabelHeader, // Título del prompt
        promptLabelPhoto: 'Selecciona una imagen',
        promptLabelPicture: 'Saca una foto',
      });
      return photo;
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      return null;
    }
  }
}
