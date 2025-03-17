import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CursoService } from '../../../services/curso.service';

@Component({
  selector: 'app-mis-cursos',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './mis-cursos.component.html',
  styleUrl: './mis-cursos.component.css'
})
export class MisCursosComponent implements OnInit {
  cursos: any[] = [];
  filtros: any = {
    fechaInicio: '',
    fechaTermino: '',
    tipoDocumento: '',
    especialidad: ''
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
    this.cursoService.visualizarCursoEmpleado(this.filtros).subscribe(data => {
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
      especialidad: ''
    };
    this.aplicarFiltros();
  }
}