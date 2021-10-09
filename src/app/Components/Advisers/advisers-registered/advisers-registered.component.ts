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
import '../../../../assets/fonts/Helvetica.ttf';
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
        console.log(this.asesores);
        this.sedes = data.sedes;
        this.proyectos = data.proyectos;
      }
    ).add(() => {
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
    this.utilService._loading = false;
    this.swalEdit.fire();
  }
  editarAsesor() {
    this.utilService._loading = true;
    this.asesoresService.updateAsesor(this.formAsesores.value, this.asesorActual.id_asesores)
      .subscribe(
        data => {
          Swal.fire({
            title: data,
            icon: 'success'
          });
          this.ngOnInit();
          this.formAsesores.reset({
            id_proyectos_nuevo: ['0'],
            id_proyectos_anterior: ['0'],
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
  uploadAdviserIneImg(ev: any): void {
    const imageIne = this.imageIne.nativeElement.files[0];
    if (imageIne) {
      this.utilService._loading = true;
      this.utilService.loadingProgress = true;
      const fr: FormData = new FormData();
      fr.append('curp', this.asesorActual.curp);
      fr.append('image_ine', imageIne);
      this.asesoresService
        .uploadAdviserImgIne(fr)
        .subscribe((data) => {
          if (data.type === HttpEventType.UploadProgress) {
            const total = data.total;
            this.utilService.progress = Math.round(
              (100 * data.loaded) / total
            );
          }
          if (data.type === HttpEventType.Response) {
            const response = data.body;
            console.log(response);
            if (!response.error) {
              Swal.fire(
                'Exito',
                'Se subio la imagen correctamente',
                'success'
              ).then(() => {
                window.location.reload();
              });
            }
          }
        })
        .add(() => {
          this.utilService._loading = false;
          this.utilService.loadingProgress = false;
        });
    }
  }
  curpUpperCase(): void {
    this.formAsesores.get('curp').setValue(this.formAsesores.get('curp').value.toUpperCase());
  }
  rfcUpperCase(): void {
    this.formAsesores.get('rfc').setValue(this.formAsesores.get('rfc').value.toUpperCase());
  }
  saveAsPdf(asesor: any) {
    this.asesorActual = asesor;
    //console.log(this.asesorActual);
    
    this.asesorActual.id_sedes = '8'
    switch (this.asesorActual.sede) {
      case 'El Mante':
        for (let i = 0; i < asesor.proyectos.length; i++) {
          const doc = new jsPDF('p', 'in', 'letter');
          doc.addImage('assets/image/certificadoAsesorManteN.jpg', 'jpg', 0, 0, 8.5, 11)
          .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
          doc.text(this.titlecasePipe.transform(this.asesorActual.nombre) + ' '
          + this.titlecasePipe.transform(this.asesorActual.ape_pat) + ' '
          + this.titlecasePipe.transform(this.asesorActual.ape_mat), 4.2, 6, { align: 'center' })
          .setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          if (asesor.proyectos[i].proyecto.length >= 30 && asesor.proyectos[i].proyecto.length <= 100) {
            const nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
            const nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, asesor.proyectos[i].proyecto.length);
            doc.text('', 0, 0).setFontSize(14);
            doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.text(nombreTemp2, 4.2, 8.3, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.setFontSize(14);
          
            doc.setFont('Helvetica');
            doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
          } else {
            if (asesor.proyectos[i].proyecto.length > 100) {
              const nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
              const nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, 50);
              const nombreTemp3 = asesor.proyectos[i].proyecto.substr(100, asesor.proyectos[i].proyecto.length);
              doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp3, 4.2, 8.5, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.setFontSize(14);
              
              doc.setFont('Helvetica');
              doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            } else {
              doc.text(asesor.proyectos[i].proyecto, 4.2, 8, { align: 'center' });
              doc.setFontSize(14);
              
              doc.setFont('Helvetica');
              doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            }
          }

        }
        break;
      case 'Reynosa':
        for (let i = 0; i < asesor.proyectos.length; i++) {
          const doc = new jsPDF('p', 'in', 'letter');
          doc.addImage('assets/image/certificadoAsesorReynosa.jpg', 'jpg', 0, 0, 8.5, 11)
            .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
          doc.text(this.titlecasePipe.transform(this.asesorActual.nombre) + ' '
            + this.titlecasePipe.transform(this.asesorActual.ape_pat) + ' '
            + this.titlecasePipe.transform(this.asesorActual.ape_mat), 4.2, 6.9, { align: 'center' })
            .setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          if (asesor.proyectos[i].proyecto.length >= 30 && asesor.proyectos[i].proyecto.length <= 100) {
            const nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
            const nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, asesor.proyectos[i].proyecto.length);
            doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.text(nombreTemp2, 4.2, 8.3, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.setFontSize(14);
            
            doc.setFont('Helvetica');
            doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
          } else {
            if (asesor.proyectos[i].proyecto.length > 100) {
              const nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
              const nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, 50);
              const nombreTemp3 = asesor.proyectos[i].proyecto.substr(100, asesor.proyectos[i].proyecto.length);
              doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp3, 4.2, 8.5, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.setFontSize(14);
              
              doc.setFont('Helvetica');
              doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            } else {
              doc.text(asesor.proyectos[i].proyecto, 4.2, 8, { align: 'center' });
              doc.setFontSize(14);
              
              doc.setFont('Helvetica');
              doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            }
          }

        }
        break;
      case 'Matamoros':
        for (let i = 0; i < asesor.proyectos.length; i++) {
          const doc = new jsPDF('p', 'in', 'letter');
          doc.addImage('assets/image/certificadoAsesorMatamoros.jpg', 'jpg', 0, 0, 8.5, 11)
            .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
          doc.text(this.titlecasePipe.transform(this.asesorActual.nombre) + ' '
            + this.titlecasePipe.transform(this.asesorActual.ape_pat) + ' '
            + this.titlecasePipe.transform(this.asesorActual.ape_mat), 4.2, 6.9, { align: 'center' })
            .setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          if (asesor.proyectos[i].proyecto.length >= 30 && asesor.proyectos[i].proyecto.length <= 100) {
            const nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
            const nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, asesor.proyectos[i].proyecto.length);
            doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.text(nombreTemp2, 4.2, 8.3, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.setFontSize(14);
            
            doc.setFont('Helvetica');
            doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
          } else {
            if (asesor.proyectos[i].proyecto.length > 100) {
              let nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
              let nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, 50);
              let nombreTemp3 = asesor.proyectos[i].proyecto.substr(100, asesor.proyectos[i].proyecto.length);
              doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp3, 4.2, 8.5, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.setFontSize(14);
              
              doc.setFont('Helvetica');
              doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            } else {
              doc.text(asesor.proyectos[i].proyecto, 4.2, 8, { align: 'center' });
              doc.setFontSize(14);
              
              doc.setFont('Helvetica');
              doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            }
          }

        }
        break;

      case 'Madero':
        for (let i = 0; i < asesor.proyectos.length; i++) {
          const doc = new jsPDF('p', 'in', 'letter');
          doc.addImage('assets/image/certificadoAsesorMadero.jpg', 'jpg', 0, 0, 8.5, 11).setFont('Helvetica').setFontSize(28).setTextColor('#646464');
          doc.text(this.titlecasePipe.transform(this.asesorActual.nombre) + ' ' + this.titlecasePipe.transform(this.asesorActual.ape_pat) + ' ' + this.titlecasePipe.transform(this.asesorActual.ape_mat), 4.2, 6, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          if (asesor.proyectos[i].proyecto.length >= 30 && asesor.proyectos[i].proyecto.length <= 100) {
            let nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
            let nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, asesor.proyectos[i].proyecto.length);
            doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.text(nombreTemp2, 4.2, 8.3, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.setFontSize(14);
           
            doc.setFont('Helvetica');
            doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
          } else {
            if (asesor.proyectos[i].proyecto.length > 100) {
              let nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
              let nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, 50);
              let nombreTemp3 = asesor.proyectos[i].proyecto.substr(100, asesor.proyectos[i].proyecto.length);
              doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp3, 4.2, 8.5, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.setFontSize(14);
              
              doc.setFont('Helvetica');
              doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            } else {
              doc.text(asesor.proyectos[i].proyecto, 4.2, 8, { align: 'center' });
              doc.setFontSize(14);
              
              doc.setFont('Helvetica');
              doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            }
          }

        }
        break;

      case 'Nuevo Laredo':
        for (let i = 0; i < asesor.proyectos.length; i++) {
          const doc = new jsPDF('p', 'in', 'letter');
          doc.addImage('assets/image/certificadoAsesorNuevoLaredo.jpg', 'jpg', 0, 0, 8.5, 11).setFont('Helvetica').setFontSize(28).setTextColor('#646464');
          doc.text(this.titlecasePipe.transform(this.asesorActual.nombre) + ' ' + this.titlecasePipe.transform(this.asesorActual.ape_pat) + ' ' + this.titlecasePipe.transform(this.asesorActual.ape_mat), 4.2, 6, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          if (asesor.proyectos[i].proyecto.length >= 30 && asesor.proyectos[i].proyecto.length <= 100) {
            let nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
            let nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, asesor.proyectos[i].proyecto.length);
            doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.text(nombreTemp2, 4.2, 8.3, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.setFontSize(14);
            
            doc.setFont('Helvetica');
            doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
          } else {
            if (asesor.proyectos[i].proyecto.length > 100) {
              let nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
              let nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, 50);
              let nombreTemp3 = asesor.proyectos[i].proyecto.substr(100, asesor.proyectos[i].proyecto.length);
              doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp3, 4.2, 8.5, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.setFontSize(14);
              
              doc.setFont('Helvetica');
              doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            } else {
              doc.text(asesor.proyectos[i].proyecto, 4.2, 8, { align: 'center' });
              doc.setFontSize(14);
              
              doc.setFont('Helvetica');
              doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            }
          }

        }
        break;
      case 'Victoria':
        for (let i = 0; i < asesor.proyectos.length; i++) {
          const doc = new jsPDF('p', 'in', 'letter');
          doc.addImage('assets/image/certificadoAsesorVictoria.jpg', 'jpg', 0, 0, 8.5, 11).setFont('Helvetica').setFontSize(28).setTextColor('#646464');
          doc.text(this.titlecasePipe.transform(this.asesorActual.nombre) + ' ' + this.titlecasePipe.transform(this.asesorActual.ape_pat) + ' ' + this.titlecasePipe.transform(this.asesorActual.ape_mat), 4.2, 6, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          if (asesor.proyectos[i].proyecto.length >= 30 && asesor.proyectos[i].proyecto.length <= 100) {
            let nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
            let nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, asesor.proyectos[i].proyecto.length);
            doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.text(nombreTemp2, 4.2, 8.3, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.setFontSize(14);
            
            doc.setFont('Helvetica');
            doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
          } else {
            if (asesor.proyectos[i].proyecto.length > 100) {
              let nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
              let nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, 50);
              let nombreTemp3 = asesor.proyectos[i].proyecto.substr(100, asesor.proyectos[i].proyecto.length);
              doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp3, 4.2, 8.5, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.setFontSize(14);
              
              doc.setFont('Helvetica');
              doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            } else {
              doc.text(asesor.proyectos[i].proyecto, 4.2, 8, { align: 'center' });
              doc.setFontSize(14);
              
              doc.setFont('Helvetica');
              doc.save('constancia Asesor ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            }
          }

        }
        break;
       /* case '8':
        for (let i = 0; i < asesor.proyectos.length; i++) {
          const doc = new jsPDF('p', 'in', 'letter');
          doc.addImage('assets/image/certificadoAsesorEstatal.jpg', 'jpg', 0, 0, 8.5, 11).setFont('Helvetica').setFontSize(28).setTextColor('#646464');
          doc.text(this.titlecasePipe.transform(this.asesorActual.nombre) + ' ' + this.titlecasePipe.transform(this.asesorActual.ape_pat) + ' ' + this.titlecasePipe.transform(this.asesorActual.ape_mat), 4.2, 6.9, { align: 'center' }).setFontSize(16).setFont('Helvetica').setTextColor('#646464');
          if (asesor.proyectos[i].proyecto.length >= 30 && asesor.proyectos[i].proyecto.length <= 100) {
            let nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
            let nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, asesor.proyectos[i].proyecto.length);
            doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.text(nombreTemp2, 4.2, 8.3, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.setFontSize(14);
            doc.addImage('assets/image/DirectorGeneral.png', 'png', 3.45, 7.75, 1.7, 1.7);
            doc.setFont('Helvetica');
            doc.save('Constancia Asesor Estatal ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
          } else {
            if (asesor.proyectos[i].proyecto.length > 100) {
              let nombreTemp = asesor.proyectos[i].proyecto.substr(0, 50);
              let nombreTemp2 = asesor.proyectos[i].proyecto.substr(50, 50);
              let nombreTemp3 = asesor.proyectos[i].proyecto.substr(100, asesor.proyectos[i].proyecto.length);
              doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.text(nombreTemp3, 4.2, 8.5, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
              doc.setFontSize(14);
              doc.addImage('assets/image/DirectorGeneral.png', 'png', 3.45, 7.75, 1.7, 1.7);
              doc.setFont('Helvetica');
              doc.save('Constancia Asesor Estatal ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            } else {
              doc.text(asesor.proyectos[i].proyecto, 4.2, 8, { align: 'center' });
              doc.setFontSize(14);
              doc.addImage('assets/image/DirectorGeneral.png', 'png', 3.45, 7.75, 1.7, 1.7);
              doc.setFont('Helvetica');
              doc.save('constancia Asesor Estatal ' + this.asesorActual.nombre + ' Proyecto ' + asesor.proyectos[i].proyecto + '.pdf');
            }
          }

        }
        break;*/
      default:
        console.log('sede no encontrada');
        Swal.fire({
          icon: 'error',
          title: 'No se encontró la sede'
        });
        break;

    }
  }
}
