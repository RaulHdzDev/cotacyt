import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Sedes } from 'src/app/models/sedes.model';
import { Session } from 'src/app/models/session.model';
import { AsesoresService } from 'src/app/services/asesores.service';
import swal from 'sweetalert2';
import { UtilService } from '../../../services/util.service';
import { RegexService } from '../../../services/regex.service';
import { forkJoin } from 'rxjs';
import { ProyectosService } from 'src/app/services/proyectos.service';
import { ProjectsRegisteredService } from 'src/app/services/project-registered.service';
import { ProjectRegistered } from 'src/app/models/project-regis.model';
import { Proyectos } from 'src/app/models/proyectos.model';

@Component({
  selector: 'app-add-adviser',
  templateUrl: './add-adviser.component.html',
  styleUrls: ['./add-adviser.component.scss']
})
export class AddAdviserComponent implements OnInit {
  formRegistroAsesor: FormGroup;
  sessionData: Session;
  constructor(
    private asesoresService: AsesoresService,
    private formBuilder: FormBuilder,
    private utilService: UtilService,
    private regexService: RegexService,
  ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.formRegistroAsesor = this.formBuilder.group({
      id_proyectos: ['0'],
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
  }

  ngOnInit(): void {

  }
  curpUpperCase(): void {
    this.formRegistroAsesor.get('curp').setValue(this.formRegistroAsesor.get('curp').value.toUpperCase());
  }
  rfcUpperCase(): void {
    this.formRegistroAsesor.get('rfc').setValue(this.formRegistroAsesor.get('rfc').value.toUpperCase());
  }
  uploadAdviserIneImg(ev: any): void {

  }
  registrarAsesor() {
    this.utilService._loading = true;
    this.asesoresService
      .postAsesor(this.formRegistroAsesor.value)
      .subscribe(
        (data) => {
          swal.fire({
            icon: 'success',
            title: 'Exito',
            text: 'El asesor se registró correctamente',
          });
          this.formRegistroAsesor.reset({
            id_proyectos: ['0']
          });
        },
        (err) => {
          swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al registrar el asesor',
          });
          console.error(err);
        }
      )
      .add(() => {
        this.utilService.loading = false;
      });
  }

}
