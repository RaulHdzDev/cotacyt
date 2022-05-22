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


@Component({
  selector: 'app-projects-registered',
  templateUrl: './projects-registered.component.html',
  styleUrls: ['./projects-registered.component.scss']
})
export class ProjectsRegisteredComponent implements OnInit, AfterViewInit {

  @ViewChild('swalid') private swalEdit: SwalComponent;
  proyectos: ProjectRegistered[];
  proyectosTabla: ProjectRegistered[] = [];
  proyectoActual: ProjectRegistered;
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
    private asesoresService: AsesoresService,
    private categoriasServices: CategoriasService,
    private obtenerProyecto: ProyectosService
  ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.proyectos = new Array<ProjectRegistered>();
    this.areas = new Array<Areas>();
    this.sedes = new Array<Sedes>();
    this.lenght = 0;
    this.asesores = new Array<Asesores>();
    this.categorias = new Array<Categorias>();
    this.utilService.loading = true;
    this.formProyecto = this.formBuilder.group({
      id_proyectos: [''],
      id_asesores: ['', [Validators.required]],
      id_areas: ['', [Validators.required]],
      id_sedes: this.sessionData.id_sedes,
      id_categorias: ['', [Validators.required]],
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
        asesores: this.asesoresService.getAsesores(),
        proyectos: this.superUser
          ? this.projectsService.obtenerTodosLosProyectosDetallesAdmin()
          : this.projectsService.obtenerTodosLosProyectosDetalles()
      }
    ).subscribe(
      data => {
        this.areas = data.areas;
        this.sedes = data.sedes;
        this.categorias = data.categorias;
        this.asesores = data.asesores;
        this.proyectos = data.proyectos;
      },
      err => console.log(err)
    ).add(() => {
      for (let i = 0; i < this.rowPerPage; i++) {
        this.proyectosTabla.push(this.proyectos[i]);
      }
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
    this.projectsService.deleteProyectsRegistred(this.proyectoActual.id_proyectos)
      .subscribe(data => {
        Swal.fire({
          title: 'Se elimino correctamente',
          icon: 'success'
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
  openSwal(proyecto: ProjectRegistered) {
    this.proyectoActual = proyecto;
    this.obtenerProyecto.obtenerProyecto(proyecto.id_proyectos).subscribe(
      data => {
        this.superUser
          ? this.formProyecto.patchValue({
            id_proyectos: data.id_proyectos,
            id_asesores: data.id_asesores,
            id_areas: data.id_areas,
            id_sedes: this.sessionData.id_sedes,
            id_categorias: data.id_categorias,
            nombre: data.nombre,
            descripcion: data.descripcion,
          })
          : this.formProyecto.patchValue({
            id_proyectos: data.id_proyectos,
            id_asesores: data.id_asesores,
            id_areas: data.id_areas,
            id_sedes: data.id_sedes,
            id_categorias: data.id_categorias,
            nombre: data.nombre,
            descripcion: data.descripcion,
          });
      }, err => {
        console.log(err);
        Swal.fire({
          title: 'Ocurrio un error al obter los datos',
          icon: 'error'
        });
      }
    );
    this.swalEdit.fire();
  }
  editarProyecto() {
    this.utilService._loading = true;
    this.projectsService.updateProyect(this.formProyecto.value)
      .subscribe(data => {
        Swal.fire({
          icon: 'success',
          title: data,
        });
        this.ngOnInit();
      }, err => {
        console.log(err);
        Swal.fire({
          icon: 'error',
          title: 'ocurrio un error al actualizar',
        });
      }).add(() => this.utilService._loading = false);
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
}
