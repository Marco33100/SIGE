import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-editar-datos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editar-datos.component.html',
  styleUrls: ['./editar-datos.component.css']
})
export class EditarDatosComponent {
  showError = false; // Nueva propiedad para controlar el mensaje de error

  // Si quieres que el mensaje desaparezca después de unos segundos
  mostrarErrorTemporal() {
    this.showError = true;
    setTimeout(() => this.showError = false, 3000); // Oculta después de 3 segundos
  }
}