import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../../services/actividad.service';

@Component({
  selector: 'app-mis-actividades',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './mis-actividades.component.html',
  styleUrl: './mis-actividades.component.css'
})
export class MisActividadesComponent implements OnInit {
  actividades: any[] = [];
  filtros: any = {
    estatusActividad: '',
    nomActividad: ''
  };

  estatusList: any[] = [];
  actividadesList: any[] = [];

  constructor(private actividadService: ActividadService) { }

  ngOnInit(): void {
    this.aplicarFiltros();
    this.cargarEstatus();
    this.cargarActividades();
  }

  cargarEstatus(): void {
    this.actividadService.obtenerEstatus().subscribe(data => {
      this.estatusList = data;
    });
  }

  cargarActividades(): void {
    this.actividadService.obtenerActividades().subscribe(data => {
      this.actividadesList = data;
    });
  }

  aplicarFiltros(): void {
    const filtros: any = {};

    if (this.filtros.estatusActividad) {
      filtros.estatusActividad = Number(this.filtros.estatusActividad);
    }

    if (this.filtros.nomActividad) {
      filtros.nomActividad = this.filtros.nomActividad;
    }

    this.actividadService.visualizarActividadesEmpleado(filtros).subscribe(data => {
      console.log('Datos recibidos del backend:', data);
      this.actividades = data.actividades;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      estatusActividad: '',
      nomActividad: ''
    };
    this.aplicarFiltros();
  }

  // Función para mapear el estatus
  mapearEstatus(estatus: number): string {
    return estatus === 1 ? 'Participó' : 'No participó';
  }
}