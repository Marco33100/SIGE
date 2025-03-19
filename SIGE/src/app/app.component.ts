import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';

// Módulos de Angular Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    RouterModule, // Importar RouterModule para usar router-outlet
    MatSidenavModule,
    MatToolbarModule, 
    MatIconModule,
    MatListModule,
    RouterOutlet 
  ]
})
export class AppComponent {
  title = 'SIGE';
}
