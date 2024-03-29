import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import { forkJoin } from 'rxjs';
import { Asesores } from 'src/app/models/asesores.model';
import { Proyectos } from 'src/app/models/proyectos.model';
import { Session } from 'src/app/models/session.model';
import { AsesoresService } from 'src/app/services/asesores.service';
import { AutoresService } from 'src/app/services/autores.service';
import { ProyectosService } from 'src/app/services/proyectos.service';
import { RegexService } from 'src/app/services/regex.service';
import { UtilService } from 'src/app/services/util.service';
import swal from 'sweetalert2';
import { ProjectsRegisteredService } from '../../../services/project-registered.service';
import { ProjectRegistered } from '../../../models/project-regis.model';

@Component({
  selector: 'app-form-author',
  templateUrl: './form-author.component.html',
  styleUrls: ['./form-author.component.scss']
})
export class FormAuthorComponent implements OnInit {
  asesores: Asesores[];
  proyectos: Proyectos[] | ProjectRegistered[];
  sessionData: Session;
  superUser: boolean;
  formRegistroAutores: FormGroup;
  constructor(
    private asesoresService: AsesoresService,
    private proyectosService: ProyectosService,
    private projectsRegistredService: ProjectsRegisteredService,
    private autoresService: AutoresService,
    private formBuilder: FormBuilder,
    private utilService: UtilService,
    private regexService: RegexService,
  ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.formRegistroAutores = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.maxLength(30)]],
      ape_pat: ['', [Validators.required, Validators.maxLength(20)]],
      ape_mat: ['', [Validators.required, Validators.maxLength(20)]],
      domicilio: ['', [Validators.required, Validators.maxLength(80)]],
      colonia: ['', [Validators.required, Validators.maxLength(80)]],
      cp: ['', [Validators.required, Validators.pattern(this.regexService.regexPostalCode())]],
      curp: ['', [Validators.required, Validators.pattern(this.regexService.regexCURP())]],
      rfc: ['', [Validators.required, Validators.pattern(this.regexService.regexRFC())]],
      telefono: ['', [Validators.required, Validators.pattern(this.regexService.regexPhone())]],
      email: ['', [Validators.required, Validators.maxLength(60), Validators.email]],
      municipio: ['', [Validators.required, Validators.maxLength(30)]],
      localidad: ['', [Validators.required, Validators.maxLength(30)]],
      escuela: ['', [Validators.required, Validators.maxLength(100)]],
      nivel_ingles: ['', [Validators.required]],
      facebook: ['', [Validators.maxLength(60)]],
      twitter: ['', [Validators.maxLength(30)]],
      id_proyectos: ['', [Validators.required]]
    });
    this.utilService._loading = true;
    if (this.sessionData.rol === 'superuser') {
      this.superUser = false;
    } else {
      this.superUser = true;
    }
  }

  ngOnInit(): void {
    this.utilService._loading = true;
    forkJoin({
      proyectos: this.superUser
      ? this.proyectosService.obtenerTodosLosProyectos(this.sessionData.id_sedes)
      : this.projectsRegistredService.obtenerTodosLosProyectosDetalles(),
    }).subscribe(
      data => {
      console.log(data);
      this.proyectos = data.proyectos;
    }, err => {
      console.log(err);
    }).add(() => this.utilService._loading = false);
    this.asesoresService.getAsesores().subscribe(data => {
      this.asesores = data;
    } );
  }
  reigstrarAutor() {
    this.utilService._loading = true;
    this.autoresService.postAutor( this.formRegistroAutores.value )
    .subscribe(
      _ => {
        swal.fire({
          icon: 'success',
          title: 'Exito',
          text: 'El proyecto se registró correctamente'
        });
        this.formRegistroAutores.reset();
      },
      err => {
        console.log(err);
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al registrar el proyecto'
        });
      }
    ).add(() => {
      this.utilService.loading = false;
    });
  }
  curpUpperCase(): void {
    this.formRegistroAutores.get('curp').setValue(this.formRegistroAutores.get('curp').value.toUpperCase());
  }
  rfcUpperCase(): void {
    this.formRegistroAutores.get('rfc').setValue(this.formRegistroAutores.get('rfc').value.toUpperCase());
  }
}
