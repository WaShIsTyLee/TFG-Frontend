import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor() {}

  async takePicture(promptLabelHeader: string) {
    try {
    
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl, 
        source: CameraSource.Prompt, 
        promptLabelHeader: promptLabelHeader, 
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
