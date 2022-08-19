import { Component, OnInit, ViewChild } from '@angular/core';
import { AutoresService } from '../../../services/autores.service';
import { UtilService } from '../../../services/util.service';
import { Autores } from '../../../models/autores.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Proyectos } from '../../../models/proyectos.model';
import { ProyectosService } from '../../../services/proyectos.service';
import { forkJoin } from 'rxjs';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
import { Session } from '../../../models/session.model';
import { jsPDF } from 'jspdf';
import '../../../../assets/cotacytResources/fonts/Helvetica.ttf';
import { TitleCasePipe } from '@angular/common';
import { RegexService } from '../../../services/regex.service';
import { ProjectsRegisteredService } from '../../../services/project-registered.service';
import { ProjectRegistered } from '../../../models/project-regis.model';
import { SedesService } from '../../../services/sedes.service';
import { Sedes } from '../../../models/sedes.model';


@Component({
  selector: 'app-authors-registered',
  templateUrl: './authors-registered.component.html',
  styleUrls: ['./authors-registered.component.scss']
})
export class AuthorsRegisteredComponent implements OnInit {

  @ViewChild('swalid') private swalEdit: SwalComponent;
  autores: Array<Autores> = [];
  autorActual: Autores;
  proyectos: Proyectos[] | ProjectRegistered[];
  sessionData: Session;
  superUser: boolean;
  formEditAutor: FormGroup;
  autoresFiltro: Autores[] = [];
  autoresTabla: Autores[] = [];
  rowPerPage = 10;
  currentPage = 1;
  sedes: Sedes[] = [];
  constructor(
    // private proyectosService: ProyectosService,
    // private projectRegistredService: ProjectsRegisteredService,
    private autoresService: AutoresService,
    private utils: UtilService,
    private sedesService: SedesService,
    // private titlecasePipe: TitleCasePipe,
    private fb: FormBuilder,
    // private regexService: RegexService
  ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.formEditAutor = this.fb.group({
      id_autores: [''],
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      ape_pat: ['', [Validators.required, Validators.maxLength(20)]],
      ape_mat: ['', [Validators.required, Validators.maxLength(20)]],
      domicilio: ['', [Validators.required, Validators.maxLength(80)]],
      // colonia: ['', [Validators.required, Validators.maxLength(80)]],
      // cp: ['', [Validators.required, Validators.pattern(this.regexService.regexPostalCode())]],
      curp: ['', [Validators.required, Validators.maxLength(18), Validators.minLength(18)]],
      rfc: ['', [Validators.required, Validators.maxLength(13), Validators.minLength(13)]],
      telefono: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.maxLength(60), Validators.email]],
      municipio: ['', [Validators.required, Validators.maxLength(30)]],
      localidad: ['', [Validators.required, Validators.maxLength(30)]],
      escuela: ['', [Validators.required, Validators.maxLength(100)]],
      nivel_ingles: ['', [Validators.required]],
      // facebook: ['', [Validators.maxLength(60)]],
      // twitter: ['', [Validators.maxLength(30)]],
      // id_proyectos: ['', [Validators.required]]
    });
    this.utils._loading = true;
    if (this.sessionData.rol === 'superuser') {
      this.superUser = false;
    } else {
      this.superUser = true;
    }
  }

  ngOnInit(): void {
    forkJoin({
      sedes: this.sedesService.getSedes(),
      autores: this.superUser
        ? this.autoresService.getAllAutoresSede()
        : this.autoresService.getAllAutores()
    }).subscribe(
      data => {
        this.sedes = data.sedes;
        this.autores = data.autores.autores;
        this.autoresFiltro = data.autores.autores;
        console.log(this.autores);
      }, err => {
        console.log(err);
      }).add(() => {
        this.autoresTabla = [];
        for (let i = 0; i < this.rowPerPage; i++) {
          if (this.autores[i]) {
            this.autoresTabla.push(this.autores[i]);
          }
        }
        this.utils._loading = false;
      });
  }

  setAutor(autor: Autores) {
    this.autorActual = autor;
  }

  deleteAutor() {
    this.utils._loading = true;
    this.autoresService.deleteAutores(this.autorActual.id_autores)
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
          this.utils._loading = false;
          this.ngOnInit();
        });
  }

  openSwal(autor: Autores) {
    // this.utils._loading = true;
    this.autorActual = autor;
    // this.superUser
    // ? this.proyectosService.obtenerTodosLosProyectos(this.sessionData.id_sedes)
    //   .subscribe(
    //     data => {
    //       this.proyectos = data;
    //     },
    //     err => console.log(err)
    //   ).add(() => this.utils._loading = false)
    // : this.projectRegistredService.obtenerTodosLosProyectosDetalles()
    //   .subscribe(
    //     data => {
    //       this.proyectos = data;
    //     }
    //   ).add(() => this.utils._loading = false);
    this.formEditAutor.get('id_autores').setValue(this.autorActual.id_autores);
    this.formEditAutor.get('nombre').setValue(this.autorActual.nombre);
    this.formEditAutor.get('ape_pat').setValue(this.autorActual.ape_pat);
    this.formEditAutor.get('ape_mat').setValue(this.autorActual.ape_mat);
    this.formEditAutor.get('domicilio').setValue(this.autorActual.domicilio);
    // this.formEditAutor.get('colonia').setValue(this.autorActual.colonia);
    // this.formEditAutor.get('cp').setValue(this.autorActual.cp);
    this.formEditAutor.get('curp').setValue(this.autorActual.curp);
    this.formEditAutor.get('rfc').setValue(this.autorActual.rfc);
    this.formEditAutor.get('telefono').setValue(this.autorActual.telefono);
    this.formEditAutor.get('email').setValue(this.autorActual.email);
    this.formEditAutor.get('municipio').setValue(this.autorActual.municipio);
    this.formEditAutor.get('localidad').setValue(this.autorActual.localidad);
    this.formEditAutor.get('escuela').setValue(this.autorActual.escuela);
    this.formEditAutor.get('nivel_ingles').setValue(this.autorActual.nivel_ingles);
    // this.formEditAutor.get('facebook').setValue(this.autorActual.facebook);
    // this.formEditAutor.get('twitter').setValue(this.autorActual.twitter);
    // this.formEditAutor.get('id_proyectos').setValue(this.autorActual.id_proyectos);
    this.swalEdit.fire();
  }

  editarAutor() {
    this.utils._loading = true;
    console.log(this.formEditAutor.value);
    this.autoresService.update(this.formEditAutor.value)
      .subscribe(
        data => {
          Swal.fire({
            title: data.msg,
            icon: data.error ? 'error' : 'success'
          });
          this.ngOnInit();
        }, err => {
          console.log(err);
          Swal.fire({
            title: 'Ocurrio un error al actualizar',
            icon: 'error'
          });
        }).add(() => {
          this.utils._loading = false;
        });
  }
  nextPage(): void {
    const total = Math.round(this.autores.length / this.rowPerPage) < (this.autores.length / this.rowPerPage)
      ? Math.round(this.autores.length / this.rowPerPage) + 1
      : Math.round(this.autores.length / this.rowPerPage);
    if (this.currentPage < total) {
      this.autoresTabla = [];
      for (let i = this.currentPage * this.rowPerPage; i < this.autores.length; i++) {
        if (i <= (this.currentPage * this.rowPerPage) + this.rowPerPage) {
          this.autoresTabla.push(this.autores[i]);
        }
      }
      this.currentPage++;
    }
  }
  previousPage(): void {
    if (this.currentPage > 1) {
      this.autoresTabla = [];
      this.currentPage--;
      for (let i = (this.currentPage * this.rowPerPage) - this.rowPerPage; i < this.autores.length; i++) {
        if (i <= ((this.currentPage * this.rowPerPage) + this.rowPerPage) - this.rowPerPage) {
          this.autoresTabla.push(this.autores[i]);
        }
      }
    }
  }
  onChangeSedeActualFiltro(value: string): void {
    this.autores = this.autoresFiltro;
    if (value !== 'todo') {
      const autoresTemp: Autores[] = [];
      this.autores.forEach((autor, _) => {
        if (autor.sede.toLowerCase() === value.toLowerCase()) {
          autoresTemp.push(autor);
        }
      });
      this.autores = autoresTemp;
    } else {
      this.autores = this.autoresFiltro;
    }
    this.autoresTabla = [];
    for (let i = 0; i < this.rowPerPage; i++) {
      if (this.autores[i]) {
        this.autoresTabla.push(this.autores[i]);
      }
    }
    this.currentPage = 1;
  }
}
