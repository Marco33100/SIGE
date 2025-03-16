import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../../services/actividad.service';

@Component({
  selector: 'app-visualizar-actividades',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './visualizar-actividades.component.html',
  styleUrl: './visualizar-actividades.component.css'
})
export class VisualizarActividadesComponent implements OnInit {
  actividades: any[] = [];
  filtros: any = {
    estatusActividad: '',
    claveEmpleado: '',
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
  
    if (this.filtros.claveEmpleado) {
      filtros.claveEmpleado = this.filtros.claveEmpleado;
    }
  
    if (this.filtros.nomActividad) {
      filtros.nomActividad = this.filtros.nomActividad;
    }
    
    this.actividadService.visualizarActividadesConFiltros(filtros).subscribe(data => {
      console.log('Datos recibidos del backend:', data);
      this.actividades = data.actividades;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      estatusActividad: '',
      claveEmpleado: '',
      nomActividad: ''
    };
    this.aplicarFiltros();
  }
}