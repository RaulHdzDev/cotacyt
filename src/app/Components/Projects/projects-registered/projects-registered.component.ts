import { AfterContentInit, AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ProjectsRegisteredService } from '../../../services/project-registered.service';
import { ProjectRegistered } from '../../../models/project-regis.model';
import { UtilService } from '../../../services/util.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Areas } from '../../../models/areas.model';
import { Sedes } from '../../../models/sedes.model';
import { Asesores } from '../../../models/asesores.model';
import { Categorias } from '../../../models/categorias.model';
import { SedesService } from '../../../services/sedes.service';
import { AreasService } from '../../../services/areas.service';
import { CategoriasService } from '../../../services/categorias.service';
import { AsesoresService } from '../../../services/asesores.service';
import { forkJoin } from 'rxjs';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ProyectosService } from '../../../services/proyectos.service';
import Swal from 'sweetalert2';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Session } from '../../../models/session.model';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { ExcelService } from 'src/app/services/excel.service';
import { InfoExcel } from 'src/app/models/info-excel.model';


@Component({
  selector: 'app-projects-registered',
  templateUrl: './projects-registered.component.html',
  styleUrls: ['./projects-registered.component.scss']
})
export class ProjectsRegisteredComponent implements OnInit, AfterViewInit {

  @ViewChild('swalid') private swalEdit: SwalComponent;
  proyectos: ProjectRegistered[];
  proyectosTabla: ProjectRegistered[] = [];
  proyectosFiltro: ProjectRegistered[] = [];
  proyectoActual: ProjectRegistered;
  infoExcel: InfoExcel[];
  proyectosExcel: InfoExcel[] = [];
  formProyecto: FormGroup;
  areas: Areas[];
  sedes: Sedes[];
  settingsAutoresNuevos: IDropdownSettings;
  settingsAutoresViejos: IDropdownSettings;
  asesores: Asesores[];
  categorias: Categorias[];
  lenght: number;
  agregado: number;
  superUser: boolean;
  sessionData: Session;
  rowPerPage = 10;
  currentPage = 1;
  sedeActual = '1';
  constructor(
    private projectsService: ProjectsRegisteredService,
    private utilService: UtilService,
    private formBuilder: FormBuilder,
    private sedesService: SedesService,
    private areasService: AreasService,
    public router: Router,
    private asesoresService: AsesoresService,
    private categoriasServices: CategoriasService,
    private obtenerProyecto: ProyectosService,
    private excelService:ExcelService
  ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.proyectos = new Array<ProjectRegistered>();
    this.infoExcel = new Array<InfoExcel>();
    this.areas = new Array<Areas>();
    this.sedes = new Array<Sedes>();
    this.lenght = 0;
    this.asesores = new Array<Asesores>();
    this.categorias = new Array<Categorias>();
    this.utilService.loading = true;
    this.formProyecto = this.formBuilder.group({
      id_proyectos: [''],
      // id_asesores: ['', [Validators.required]],
      areas: ['', [Validators.required]],
      sede: this.sessionData.id_sedes,
      categorias: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
    });
    if (this.sessionData.rol === 'superuser') {
      this.superUser = false;
    } else {
      this.superUser = true;
    }
  }

  ngOnInit(): void {
    forkJoin(
      {
        areas: this.areasService.getAreas(),
        sedes: this.sedesService.getSedes(),
        categorias: this.categoriasServices.getAllCategrias(),
        asesores: this.asesoresService.getAllAsesores(),
        infoExcel: this.excelService.getProjectsExcel(),
        proyectos: this.superUser
          ? this.projectsService.getAllProjectsSede()
          : this.projectsService.getAllProjects()
      }
    ).subscribe(
      data => {
        this.areas = data.areas;
        this.sedes = data.sedes;
        this.categorias = data.categorias;
        this.asesores = data.asesores.asesores;
        this.proyectos = data.proyectos.proyectos;
        this.proyectosFiltro = data.proyectos.proyectos;
        this.infoExcel = data.infoExcel.data;
        console.log(data.infoExcel);
        console.log(data.infoExcel.data);
      },
      err => console.log(err)
    ).add(() => {
      this.proyectosTabla = [];
      this.proyectosExcel = [];
      for (let i = 0; i < this.rowPerPage; i++) {
        if (this.proyectos[i]) {
          this.proyectosTabla.push(this.proyectos[i]);
        }
      }
      for (let i = 0; i < this.infoExcel.length; i++) {
        if (this.infoExcel[i]) {
          this.proyectosExcel.push(this.infoExcel[i]);
        }
      }
      console.log(this.proyectosExcel);
      this.utilService._loading = false;
    });
  }
  ngAfterViewInit(): void {
    if (this.sessionData.rol === 'superuser') {
      this.superUser = false;
    } else {
      this.superUser = true;
    }
  }
  setProyectoActual(proyecto: ProjectRegistered) {
    this.proyectoActual = proyecto;
  }
  deleteProyectRegistred() {
    this.utilService.loading = true;
    this.projectsService.delete(this.proyectoActual.id_proyectos.toString())
      .subscribe(data => {
        Swal.fire({
          title: data.msg,
          icon: data.error ? 'error' : 'success'
        });
        this.ngOnInit();
      },
        err => {
          console.log(err);
          Swal.fire({
            title: 'Ocurrio un error',
            icon: 'error',
          });
        }
      ).add(() => {
        this.utilService.loading = false;
      });
  }
  openSwal(proyecto: any) {
    this.superUser
      ? this.formProyecto.patchValue({
        id_proyectos: proyecto.id_proyectos,
        // id_asesores: proyecto.id_asesores,
        areas: proyecto.areas,
        sede: this.sessionData.sede,
        categorias: proyecto.categorias,
        nombre: proyecto.nombre,
        descripcion: proyecto.resumen,
      })
      : this.formProyecto.patchValue({
        id_proyectos: proyecto.id_proyectos,
        // id_asesores: proyecto.id_asesores,
        areas: proyecto.areas,
        sede: proyecto.sede,
        categorias: proyecto.categorias,
        nombre: proyecto.nombre,
        descripcion: proyecto.resumen,
      });
    this.swalEdit.fire();
  }
  editarProyecto() {
    this.utilService._loading = true;
    this.projectsService.update(this.formProyecto.value)
      .subscribe(data => {
        Swal.fire({
          icon: data.error ? 'error' : 'success',
          title: data.msg,
        }).then(() => {
          this.ngOnInit();
        });
      }, err => {
        console.log(err);
        Swal.fire({
          icon: 'error',
          title: 'ocurrio un error al actualizar',
        });
      }).add(() => this.utilService._loading = false);
  }
  onChangeSedeActualFiltro(value: string): void {
    this.proyectos = this.proyectosFiltro;
    if (value !== 'todo') {
      const juecesTemp: ProjectRegistered[] = [];
      this.proyectos.forEach((proyecto, _) => {
        if (proyecto.sede.toLowerCase() === value.toLowerCase()) {
          juecesTemp.push(proyecto);
        }
      });
      this.proyectos = juecesTemp;
    } else {
      this.proyectos = this.proyectosFiltro;
    }
    this.proyectosTabla = [];
    for (let i = 0; i < this.rowPerPage; i++) {
      if (this.proyectos[i]) {
        this.proyectosTabla.push(this.proyectos[i]);
      }
    }
    this.currentPage = 1;
  }
  nextPage(): void {
    const total = Math.round(this.proyectos.length / this.rowPerPage) < (this.proyectos.length / this.rowPerPage)
      ? Math.round(this.proyectos.length / this.rowPerPage) + 1
      : Math.round(this.proyectos.length / this.rowPerPage);
    if (this.currentPage < total) {
      this.proyectosTabla = [];
      for (let i = this.currentPage * this.rowPerPage; i < this.proyectos.length; i++) {
        if (i <= (this.currentPage * this.rowPerPage) + this.rowPerPage) {
          this.proyectosTabla.push(this.proyectos[i]);
        }
      }
      this.currentPage++;
    }
  }
  previousPage(): void {
    if (this.currentPage > 1) {
      this.proyectosTabla = [];
      this.currentPage--;
      for (let i = (this.currentPage * this.rowPerPage) - this.rowPerPage; i < this.proyectos.length; i++) {
        if (i <= ((this.currentPage * this.rowPerPage) + this.rowPerPage) - this.rowPerPage) {
          this.proyectosTabla.push(this.proyectos[i]);
        }
      }
    }
  }

  exportarExcel(): void {
    // let element = document.getElementById('proyectos');
    // const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    // const book: XLSX.WorkBook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(book, worksheet, 'Sheet1');

    // XLSX.writeFile(book, "Proyectos.xlsx");
    this.excelService.exportAsExcelFile(this.proyectosExcel, 'proyectos');
  }
}
