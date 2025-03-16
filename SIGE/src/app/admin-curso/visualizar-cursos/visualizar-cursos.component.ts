import { Component, OnInit } from '@angular/core';
import { CursoService } from '../../../services/curso.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visualizar-cursos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './visualizar-cursos.component.html',
  styleUrl: './visualizar-cursos.component.css'
})
export class VisualizarCursosComponent implements OnInit {
  cursos: any[] = [];
  filtros: any = {
    fechaInicio: '',
    fechaTermino: '',
    tipoDocumento: '',
    especialidad: '',
    claveEmpleado: ''
  };

  especialidadesList: any[] = [];
  documentosList: any[] = [];

  constructor(private cursoService: CursoService) { }

  ngOnInit(): void {
    this.aplicarFiltros();
    this.cargarEspecialidades();
    this.cargarTiposDocumentos();
  }

  aplicarFiltros(): void {
    this.cursoService.visualizarCursosConFiltros(this.filtros).subscribe(data => {
      this.cursos = data.cursos;
    });
  }

  cargarEspecialidades(): void {
    this.cursoService.obtenerEspecialidades().subscribe(data => {
      this.especialidadesList = data;
    });
  }

  cargarTiposDocumentos(): void {
    this.cursoService.obtenerTiposDocumentos().subscribe(data => {
      this.documentosList = data;
    });
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaInicio: '',
      fechaTermino: '',
      tipoDocumento: '',
      especialidad: '',
      claveEmpleado: ''
    };
    this.aplicarFiltros();
  }
}
