import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AsesoresService } from '../../../services/asesores.service';
import { Asesores } from '../../../models/asesores.model';
import { UtilService } from '../../../services/util.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { Sedes } from '../../../models/sedes.model';
import { SedesService } from '../../../services/sedes.service';
import { forkJoin } from 'rxjs';
import { Session } from '../../../models/session.model';
import { jsPDF } from 'jspdf';
import '../../../../assets/cotacytResources/fonts/Helvetica.ttf';
import { TitleCasePipe } from '@angular/common';
import { RegexService } from '../../../services/regex.service';
import { ProyectosService } from 'src/app/services/proyectos.service';
import { ProjectsRegisteredService } from 'src/app/services/project-registered.service';
import { ProjectRegistered } from 'src/app/models/project-regis.model';
import { Proyectos } from 'src/app/models/proyectos.model';
import { HttpEventType } from '@angular/common/http';


@Component({
  selector: 'app-advisers-registered',
  templateUrl: './advisers-registered.component.html',
  styleUrls: ['./advisers-registered.component.scss']
})
export class AdvisersRegisteredComponent implements OnInit {

  @ViewChild('swalid') private swalEdit: SwalComponent;
  public asesores: Array<Asesores>;
  asesorActual: Asesores;
  formAsesores: FormGroup;
  proyectos: Proyectos[] | ProjectRegistered[];
  sessionData: Session;
  sedes: Sedes[];
  superUser: boolean;
  asesoresTabla: Asesores[] = [];
  rowPerPage = 10;
  currentPage = 1;
  @ViewChild('image_ine', {
    read: ElementRef,
  })
  imageIne: ElementRef;
  constructor(
    private asesoresService: AsesoresService,
    private utilService: UtilService,
    private sedesService: SedesService,
    private formBuilder: FormBuilder,
    private titlecasePipe: TitleCasePipe,
    private regexService: RegexService,
    private proyectosService: ProyectosService,
    private projectsRegistredService: ProjectsRegisteredService,
  ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.utilService.loading = true;
    this.formAsesores = this.formBuilder.group({
      id_proyectos_nuevo: ['0'],
      id_proyectos_anterior: ['0'],
      id_asesores: [''],
      nombre: ['', [Validators.required, Validators.maxLength(30), Validators.minLength(2)]],
      ape_pat: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(2)]],
      ape_mat: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(2)]],
      domicilio: ['', [Validators.required, Validators.maxLength(80), Validators.minLength(2)]],
      colonia: ['', [Validators.required, Validators.maxLength(80), Validators.minLength(2)]],
      cp: ['', [Validators.required, Validators.pattern(this.regexService.regexPostalCode()), Validators.minLength(2)]],
      curp: ['', [Validators.required, Validators.pattern(this.regexService.regexCURP()), Validators.minLength(2)]],
      rfc: ['', [Validators.required, Validators.pattern(this.regexService.regexRFC()), Validators.minLength(2)]],
      telefono: ['', [Validators.required, Validators.pattern(this.regexService.regexPhone()), Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.maxLength(60), Validators.email, Validators.minLength(2)]],
      municipio: ['', [Validators.required, Validators.maxLength(30), Validators.minLength(2)]],
      localidad: ['', [Validators.required, Validators.maxLength(30), Validators.minLength(2)]],
      escuela: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(2)]],
      facebook: ['', [Validators.maxLength(50), Validators.minLength(2)]],
      twitter: ['', [Validators.maxLength(30), Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.maxLength(1000), Validators.minLength(2)]],
    });
    if (this.sessionData.rol === 'superuser') {
      this.superUser = false;
    } else {
      this.superUser = true;
    }
  }

  ngOnInit(): void {
    forkJoin({
      asesores: this.superUser
        ? this.asesoresService.getAsesores()
        : this.asesoresService.getAsesoresSuperUser(),
      proyectos: this.superUser
        ? this.proyectosService.obtenerTodosLosProyectos(this.sessionData.id_sedes)
        : this.projectsRegistredService.obtenerTodosLosProyectosDetalles(),
      sedes: this.sedesService.getSedes()
    }).subscribe(
      data => {
        this.asesores = data.asesores;
        this.sedes = data.sedes;
        this.proyectos = data.proyectos;
      }
    ).add(() => {
      for (let i = 0; i < this.rowPerPage; i++) {
        if (this.asesores[i]) {
          this.asesoresTabla.push(this.asesores[i]);
        }
      }
      this.utilService._loading = false;
    });
  }
  setAsesor(asesor: Asesores) {
    this.asesorActual = asesor;
  }
  deleteAsesor() {
    this.utilService._loading = true;
    this.asesoresService.deleteAsesor(this.asesorActual.id_asesores)
      .subscribe(data => {
        Swal.fire({
          title: 'Se elimino correctamente',
          icon: 'success'
        });
      },
        err => {
          console.log(err);
          Swal.fire({
            title: 'Ocurrio un error al eliminar',
            icon: 'error'
          });
        }).add(() => {
          this.utilService._loading = false;
          this.ngOnInit();
        });
  }
  openSwal(asesor: Asesores) {
    this.utilService._loading = true;
    this.asesorActual = asesor;
    this.formAsesores.get('nombre').setValue(this.asesorActual.nombre);
    this.formAsesores.get('ape_pat').setValue(this.asesorActual.ape_pat);
    this.formAsesores.get('ape_mat').setValue(this.asesorActual.ape_mat);
    this.formAsesores.get('domicilio').setValue(this.asesorActual.domicilio);
    this.formAsesores.get('colonia').setValue(this.asesorActual.colonia);
    this.formAsesores.get('cp').setValue(this.asesorActual.cp);
    this.formAsesores.get('curp').setValue(this.asesorActual.curp);
    this.formAsesores.get('rfc').setValue(this.asesorActual.rfc);
    this.formAsesores.get('telefono').setValue(this.asesorActual.telefono);
    this.formAsesores.get('email').setValue(this.asesorActual.email);
    this.formAsesores.get('municipio').setValue(this.asesorActual.municipio);
    this.formAsesores.get('localidad').setValue(this.asesorActual.localidad);
    this.formAsesores.get('escuela').setValue(this.asesorActual.escuela);
    this.formAsesores.get('facebook').setValue(this.asesorActual.facebook);
    this.formAsesores.get('twitter').setValue(this.asesorActual.twitter);
    this.formAsesores.get('descripcion').setValue(this.asesorActual.descripcion);
    this.formAsesores.get('id_asesores').setValue(this.asesorActual.id_asesores);
    this.utilService._loading = false;
    this.swalEdit.fire();
  }
  editarAsesor() {
    this.utilService._loading = true;
    this.asesoresService.updateAsesor(this.formAsesores.value)
      .subscribe(
        data => {
          Swal.fire({
            title: data,
            icon: 'success'
          });
          this.ngOnInit();
          this.formAsesores.reset({
            id_proyectos_nuevo: '0',
            id_proyectos_anterior: '0',
          });
        }, err => {
          console.log(err);
          Swal.fire({
            title: 'Ocurrio un error al editar',
            icon: 'error'
          });
        }).add(() => {
          this.utilService._loading = false;
        });
  }
  curpUpperCase(): void {
    this.formAsesores.get('curp').setValue(this.formAsesores.get('curp').value.toUpperCase());
  }
  rfcUpperCase(): void {
    this.formAsesores.get('rfc').setValue(this.formAsesores.get('rfc').value.toUpperCase());
  }
  nextPage(): void {
    const total = Math.round(this.asesores.length / this.rowPerPage) < (this.asesores.length / this.rowPerPage)
      ? Math.round(this.asesores.length / this.rowPerPage) + 1
      : Math.round(this.asesores.length / this.rowPerPage);
    if (this.currentPage < total) {
      this.asesoresTabla = [];
      for (let i = this.currentPage * this.rowPerPage; i < this.asesores.length; i++) {
        if (i <= (this.currentPage * this.rowPerPage) + this.rowPerPage) {
          this.asesoresTabla.push(this.asesores[i]);
        }
      }
      this.currentPage++;
    }
  }
  previousPage(): void {
    if (this.currentPage > 1) {
      this.asesoresTabla = [];
      this.currentPage--;
      for (let i = (this.currentPage * this.rowPerPage) - this.rowPerPage; i < this.asesores.length; i++) {
        if (i <= ((this.currentPage * this.rowPerPage) + this.rowPerPage) - this.rowPerPage) {
          this.asesoresTabla.push(this.asesores[i]);
        }
      }
    }
  }
}
