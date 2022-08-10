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
import '../../../../assets/cotacytResources/fonts/Helvetica.ttf';
import { TitleCasePipe } from '@angular/common';
import { ProjectRegistered } from 'src/app/models/project-regis.model';
import { Proyectos } from 'src/app/models/proyectos.model';


@Component({
  selector: 'app-advisers-registered',
  templateUrl: './advisers-registered.component.html',
  styleUrls: ['./advisers-registered.component.scss']
})
export class AdvisersRegisteredComponent implements OnInit {

  @ViewChild('swalid') private swalEdit: SwalComponent;
  asesores: Array<Asesores> = [];
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
  ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.utilService.loading = true;
    this.formAsesores = this.formBuilder.group({
      id_asesores: [''],
      nombre: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(2)]],
      ape_pat: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(2)]],
      ape_mat: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(2)]],
      domicilio: ['', [Validators.required, Validators.maxLength(255), Validators.minLength(2)]],
      curp: ['', [Validators.required]],
      rfc: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.maxLength(100), Validators.email, Validators.minLength(2)]],
      municipio: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(2)]],
      localidad: ['', [Validators.required, Validators.maxLength(100), Validators.minLength(2)]],
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
        ? this.asesoresService.getAllAsesoresSede()
        : this.asesoresService.getAllAsesores(),
      sedes: this.sedesService.getSedes()
    }).subscribe(
      data => {
        this.asesores = data.asesores.asesores;
        this.sedes = data.sedes;
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
    this.formAsesores.get('curp').setValue(this.asesorActual.curp);
    this.formAsesores.get('rfc').setValue(this.asesorActual.rfc);
    this.formAsesores.get('telefono').setValue(this.asesorActual.telefono);
    this.formAsesores.get('email').setValue(this.asesorActual.email);
    this.formAsesores.get('municipio').setValue(this.asesorActual.municipio);
    this.formAsesores.get('localidad').setValue(this.asesorActual.localidad);
    this.formAsesores.get('descripcion').setValue(this.asesorActual.descripcion);
    this.formAsesores.get('id_asesores').setValue(this.asesorActual.id_asesores);
    console.log(this.asesorActual);
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
