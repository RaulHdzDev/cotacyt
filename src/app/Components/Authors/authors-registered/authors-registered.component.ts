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
import '../../../../assets/fonts/Helvetica.ttf';
import { TitleCasePipe } from '@angular/common';
import { RegexService } from '../../../services/regex.service';
import { ProjectsRegisteredService } from '../../../services/project-registered.service';
import { ProjectRegistered } from '../../../models/project-regis.model';


@Component({
  selector: 'app-authors-registered',
  templateUrl: './authors-registered.component.html',
  styleUrls: ['./authors-registered.component.scss']
})
export class AuthorsRegisteredComponent implements OnInit {

  @ViewChild('swalid') private swalEdit: SwalComponent;
  autores: Autores[];
  autorActual: Autores;
  proyectos: Proyectos[] | ProjectRegistered[];
  sessionData: Session;
  superUser: boolean;
  formEditAutor: FormGroup;
  constructor(
    private proyectosService: ProyectosService,
    private projectRegistredService: ProjectsRegisteredService,
    private autoresService: AutoresService,
    private utils: UtilService,
    private titlecasePipe: TitleCasePipe,
    private fb: FormBuilder,
    private regexService: RegexService
  ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.formEditAutor = this.fb.group({
      name_author: ['', [Validators.required, Validators.maxLength(30)]],
      last_name: ['', [Validators.required, Validators.maxLength(20)]],
      second_last_name: ['', [Validators.required, Validators.maxLength(20)]],
      address: ['', [Validators.required, Validators.maxLength(80)]],
      suburb: ['', [Validators.required, Validators.maxLength(80)]],
      postal_code: ['', [Validators.required, Validators.pattern(this.regexService.regexPostalCode())]],
      curp: ['', [Validators.required, Validators.pattern(this.regexService.regexCURP())]],
      rfc: ['', [Validators.required, Validators.pattern(this.regexService.regexRFC())]],
      phone_contact: ['', [Validators.required, Validators.pattern(this.regexService.regexPhone())]],
      email: ['', [Validators.required, Validators.maxLength(60), Validators.email]],
      city: ['', [Validators.required, Validators.maxLength(30)]],
      locality: ['', [Validators.required, Validators.maxLength(30)]],
      school: ['', [Validators.required, Validators.maxLength(100)]],
      levelEnglish: ['', [Validators.required]],
      facebook: ['', [Validators.maxLength(60)]],
      twitter: ['', [Validators.maxLength(30)]],
      id_proyectos: ['', [Validators.required]]
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
      autores: this.superUser
        ? this.autoresService.getAutores()
        : this.autoresService.getAutoresSuperUser()
    }).subscribe(
      data => {
        this.autores = data.autores;
        console.log(this.autores);
      }, err => {
        console.log(err);
      }).add(() => {
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
    this.utils._loading = true;
    this.autorActual = autor;
    this.superUser
    ? this.proyectosService.obtenerTodosLosProyectos(this.sessionData.id_sedes)
      .subscribe(
        data => {
          this.proyectos = data;
        },
        err => console.log(err)
      ).add(() => this.utils._loading = false)
    : this.projectRegistredService.obtenerTodosLosProyectosDetalles()
      .subscribe(
        data => {
          this.proyectos = data;
        }
      ).add(() => this.utils._loading = false);
    this.formEditAutor.controls.address.disable();
    this.formEditAutor.controls.suburb.disable();
    this.formEditAutor.controls.postal_code.disable();
    this.formEditAutor.controls.phone_contact.disable();
    this.formEditAutor.controls.email.disable();
    this.formEditAutor.controls.city.disable();
    this.formEditAutor.controls.locality.disable();
    this.formEditAutor.controls.school.disable();
    this.formEditAutor.controls.levelEnglish.disable();
    this.formEditAutor.controls.facebook.disable();
    this.formEditAutor.controls.twitter.disable();
    this.formEditAutor.get('name_author').setValue(this.autorActual.nombre);
    this.formEditAutor.get('last_name').setValue(this.autorActual.ape_pat);
    this.formEditAutor.get('second_last_name').setValue(this.autorActual.ape_mat);
    this.formEditAutor.get('address').setValue(this.autorActual.domicilio);
    this.formEditAutor.get('suburb').setValue(this.autorActual.colonia);
    this.formEditAutor.get('postal_code').setValue(this.autorActual.cp);
    this.formEditAutor.get('curp').setValue(this.autorActual.curp);
    this.formEditAutor.get('rfc').setValue(this.autorActual.rfc);
    this.formEditAutor.get('phone_contact').setValue(this.autorActual.telefono);
    this.formEditAutor.get('email').setValue(this.autorActual.email);
    this.formEditAutor.get('city').setValue(this.autorActual.municipio);
    this.formEditAutor.get('locality').setValue(this.autorActual.localidad);
    this.formEditAutor.get('school').setValue(this.autorActual.escuela);
    this.formEditAutor.get('levelEnglish').setValue(this.autorActual.nivel_ingles);
    this.formEditAutor.get('facebook').setValue(this.autorActual.facebook);
    this.formEditAutor.get('twitter').setValue(this.autorActual.twitter);
    this.formEditAutor.get('id_proyectos').setValue(this.autorActual.id_proyectos);
    this.swalEdit.fire();
  }

  editarAutor() {
    this.utils._loading = true;
    this.autoresService.updateAutor(this.formEditAutor.value, this.autorActual.id_autores)
      .subscribe(
        data => {
          Swal.fire({
            title: data,
            icon: 'success'
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
  curpUpperCase(): void {
    this.formEditAutor.get('curp').setValue(this.formEditAutor.get('curp').value.toUpperCase());
  }
  rfcUpperCase(): void {
    this.formEditAutor.get('rfc').setValue(this.formEditAutor.get('rfc').value.toUpperCase());
  }
  saveAsPdf(autor: Autores, autores: any[]) {
    let nombresAutores: string[] = autores;
    this.autorActual = autor;
    let id_nombres: any[];
    let id_paterno: any[];
    let id_materno: any[];
    switch (this.autorActual.id_sedes) {
      case '1':
        const doc = new jsPDF('p', 'in', 'letter');
        doc.addImage('assets/image/ConstanciaParticipantesMante.jpg', 'jpg', 0, 0, 8.5, 11)
          .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc.text(this.titlecasePipe.transform(this.autorActual.nombre) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_pat) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_mat), 4.2, 6.9, { align: 'center' }).setFontSize(20).setFont('Helvetica').setTextColor('#646464');
        if (this.autorActual.proyecto.length >= 30 && this.autorActual.proyecto.length <= 100) {
          const nombreTemp = this.autorActual.proyecto.substr(0, 50);
          const nombreTemp2 = this.autorActual.proyecto.substr(50, this.autorActual.proyecto.length);
          doc.text('', 0, 0).setFontSize(14);
          doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc.setFontSize(14);
          doc.addImage('assets/image/DirectorGeneral.png', 'png', 1.5, 7.9, 1.4, 1.4);
          doc.addImage('assets/image/DirectorMante.png', 'png', 5.7, 8.2, 1.4, 1.1);
          doc.setFont('Helvetica');
          doc.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
        } else {
          if (this.autorActual.proyecto.length > 100) {
            const nombreTemp = this.autorActual.proyecto.substr(0, 50);
            const nombreTemp2 = this.autorActual.proyecto.substr(50, 50);
            const nombreTemp3 = this.autorActual.proyecto.substr(100, this.autorActual.proyecto.length);
            doc.text('', 0, 0).setFontSize(14);
            doc.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.text(nombreTemp3, 4.2, 8.50, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc.addImage('assets/image/DirectorGeneral.png', 'png', 1.5, 7.9, 1.4, 1.4);
            doc.addImage('assets/image/DirectorMante.png', 'png', 5.7, 8.2, 1.4, 1.1);
            doc.setFont('Helvetica');
            doc.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          } else {
            doc.text(this.autorActual.proyecto, 4.2, 8, { align: 'center' });
            doc.setFontSize(14);
            doc.addImage('assets/image/DirectorGeneral.png', 'png', 1.5, 7.9, 1.4, 1.4);
            doc.addImage('assets/image/DirectorMante.png', 'png', 5.7, 8.2, 1.4, 1.1);
            doc.setFont('Helvetica');
            doc.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          }
        }
        break;
      case '2':
        const doc1 = new jsPDF('p', 'in', 'letter');
        doc1.addImage('assets/image/ConstanciaParticipantesReynosa.jpg', 'jpg', 0, 0, 8.5, 11)
          .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc1.text(this.titlecasePipe.transform(this.autorActual.nombre) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_pat) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_mat), 4.2, 6.9, { align: 'center' }).setFontSize(20).setFont('Helvetica').setTextColor('#646464');
        if (this.autorActual.proyecto.length >= 30 && this.autorActual.proyecto.length <= 100) {
          const nombreTemp = this.autorActual.proyecto.substr(0, 50);
          const nombreTemp2 = this.autorActual.proyecto.substr(50, this.autorActual.proyecto.length);
          doc1.text('', 0, 0).setFontSize(14);
          doc1.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc1.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc1.setFontSize(14);
          doc1.addImage('assets/image/DirectorGeneral.png', 'png', 1.5, 7.9, 1.4, 1.4);
          doc1.addImage('assets/image/DirectorReynosa.png', 'png', 5.7, 8.2, 1.4, 1.1);
          doc1.setFont('Helvetica');
          doc1.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
        } else {
          if (this.autorActual.proyecto.length > 100) {
            const nombreTemp = this.autorActual.proyecto.substr(0, 50);
            const nombreTemp2 = this.autorActual.proyecto.substr(50, 50);
            const nombreTemp3 = this.autorActual.proyecto.substr(100, this.autorActual.proyecto.length);
            doc1.text('', 0, 0).setFontSize(14);
            doc1.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc1.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc1.text(nombreTemp3, 4.2, 8.50, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc1.addImage('assets/image/DirectorGeneral.png', 'png', 1.5, 7.9, 1.4, 1.4);
            doc1.addImage('assets/image/DirectorReynosa.png', 'png', 5.7, 8.2, 1.4, 1.1);
            doc1.setFont('Helvetica');
            doc1.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          } else {
            doc1.text(this.autorActual.proyecto, 4.2, 8, { align: 'center' });
            doc1.setFontSize(14);
            doc1.addImage('assets/image/DirectorGeneral.png', 'png', 1.5, 7.9, 1.4, 1.4);
            doc1.addImage('assets/image/DirectorReynosa.png', 'png', 5.7, 8.2, 1.4, 1.1);
            doc1.setFont('Helvetica');
            doc1.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          }
        }
        break;
      case '3':
        const doc2 = new jsPDF('p', 'in', 'letter');
        doc2.addImage('assets/image/ConstanciaParticipantesMatamoros.jpg', 'jpg', 0, 0, 8.5, 11).setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc2.text(this.titlecasePipe.transform(this.autorActual.nombre) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_pat) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_mat), 4.2, 6.9, { align: 'center' }).setFontSize(20).setFont('Helvetica').setTextColor('#646464');
        if (this.autorActual.proyecto.length >= 30 && this.autorActual.proyecto.length <= 100) {
          const nombreTemp = this.autorActual.proyecto.substr(0, 50);
          const nombreTemp2 = this.autorActual.proyecto.substr(50, this.autorActual.proyecto.length);
          doc2.text('', 0, 0).setFontSize(14);
          doc2.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc2.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');

          doc2.addImage('assets/image/DirectorGeneral.png', 'png', 1.5, 7.9, 1.4, 1.4);
          doc2.addImage('assets/image/DirectorMatamoros.png', 'png', 5.7, 8.2, 1.4, 1.1);
          doc2.setFont('Helvetica');
          doc2.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
        } else {
          if (this.autorActual.proyecto.length > 100) {
            const nombreTemp = this.autorActual.proyecto.substr(0, 50);
            const nombreTemp2 = this.autorActual.proyecto.substr(50, 50);
            const nombreTemp3 = this.autorActual.proyecto.substr(100, this.autorActual.proyecto.length);
            doc2.text('', 0, 0).setFontSize(14);
            doc2.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc2.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc2.text(nombreTemp3, 4.2, 8.50, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc2.addImage('assets/image/DirectorGeneral.png', 'png', 1.5, 7.9, 1.4, 1.4);
            doc2.addImage('assets/image/DirectorMatamoros.png', 'png', 5.7, 8.2, 1.4, 1.1);
            doc2.setFont('Helvetica');
            doc2.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          } else {
            doc2.text(this.autorActual.proyecto, 4.2, 8, { align: 'center' });
            doc2.setFontSize(14);
            doc2.addImage('assets/image/DirectorGeneral.png', 'png', 1.5, 7.9, 1.4, 1.4);
            doc2.addImage('assets/image/DirectorMatamoros.png', 'png', 5.7, 8.2, 1.4, 1.1);
            doc2.setFont('Helvetica');
            doc2.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          }
        }
        break;
      case '4':
        const doc3 = new jsPDF('p', 'in', 'letter');
        doc3.addImage('assets/image/ConstanciaParticipantesMadero.jpg', 'jpg', 0, 0, 8.5, 11).setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc3.text(this.titlecasePipe.transform(this.autorActual.nombre) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_pat) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_mat), 4.2, 6.9, { align: 'center' }).setFontSize(20).setFont('Helvetica').setTextColor('#646464');
        if (this.autorActual.proyecto.length >= 30 && this.autorActual.proyecto.length <= 100) {
          const nombreTemp = this.autorActual.proyecto.substr(0, 50);
          const nombreTemp2 = this.autorActual.proyecto.substr(50, this.autorActual.proyecto.length);
          doc3.text('', 0, 0).setFontSize(14);
          doc3.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc3.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc3.setFontSize(14);

          doc3.setFont('Helvetica');
          doc3.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
        } else {
          if (this.autorActual.proyecto.length > 100) {
            const nombreTemp = this.autorActual.proyecto.substr(0, 50);
            const nombreTemp2 = this.autorActual.proyecto.substr(50, 50);
            const nombreTemp3 = this.autorActual.proyecto.substr(100, this.autorActual.proyecto.length);
            doc3.text('', 0, 0).setFontSize(14);
            doc3.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc3.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc3.text(nombreTemp3, 4.2, 8.50, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');

            doc3.setFont('Helvetica');
            doc3.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          } else {
            doc3.text(this.autorActual.proyecto, 4.2, 8, { align: 'center' });
            doc3.setFontSize(14);

            doc3.setFont('Helvetica');
            doc3.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          }
        }
        break;
      case '5':
        const doc4 = new jsPDF('p', 'in', 'letter');
        doc4.addImage('assets/image/ConstanciaParticipantesJaumave.jpg', 'jpg', 0, 0, 8.5, 11).setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc4.text(this.titlecasePipe.transform(this.autorActual.nombre) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_pat) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_mat), 4.2, 6.9, { align: 'center' }).setFontSize(20).setFont('Helvetica').setTextColor('#646464');
        if (this.autorActual.proyecto.length >= 30 && this.autorActual.proyecto.length <= 100) {
          const nombreTemp = this.autorActual.proyecto.substr(0, 50);
          const nombreTemp2 = this.autorActual.proyecto.substr(50, this.autorActual.proyecto.length);
          doc4.text('', 0, 0).setFontSize(14);
          doc4.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc4.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc4.setFontSize(14);

          doc4.setFont('Helvetica');
          doc4.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
        } else {
          if (this.autorActual.proyecto.length > 100) {
            const nombreTemp = this.autorActual.proyecto.substr(0, 50);
            const nombreTemp2 = this.autorActual.proyecto.substr(50, 50);
            const nombreTemp3 = this.autorActual.proyecto.substr(100, this.autorActual.proyecto.length);
            doc4.text('', 0, 0).setFontSize(14);
            doc4.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc4.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc4.text(nombreTemp3, 4.2, 8.50, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');

            doc4.setFont('Helvetica');
            doc4.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          } else {
            doc4.text(this.autorActual.proyecto, 4.2, 8, { align: 'center' });
            doc4.setFontSize(14);

            doc4.setFont('Helvetica');
            doc4.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          }
        }
        break;

      case '6':
        const doc5 = new jsPDF('p', 'in', 'letter');
        doc5.addImage('assets/image/ConstanciaParticipantesNuevoLaredo.jpg', 'jpg', 0, 0, 8.5, 11).setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc5.text(this.titlecasePipe.transform(this.autorActual.nombre) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_pat) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_mat), 4.2, 6.9, { align: 'center' }).setFontSize(20).setFont('Helvetica').setTextColor('#646464');
        if (this.autorActual.proyecto.length >= 30 && this.autorActual.proyecto.length <= 100) {
          const nombreTemp = this.autorActual.proyecto.substr(0, 50);
          const nombreTemp2 = this.autorActual.proyecto.substr(50, this.autorActual.proyecto.length);
          doc5.text('', 0, 0).setFontSize(14);
          doc5.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc5.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc5.setFontSize(14);

          doc5.setFont('Helvetica');
          doc5.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
        } else {
          if (this.autorActual.proyecto.length > 100) {
            const nombreTemp = this.autorActual.proyecto.substr(0, 50);
            const nombreTemp2 = this.autorActual.proyecto.substr(50, 50);
            const nombreTemp3 = this.autorActual.proyecto.substr(100, this.autorActual.proyecto.length);
            doc5.text('', 0, 0).setFontSize(14);
            doc5.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc5.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc5.text(nombreTemp3, 4.2, 8.50, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');

            doc5.setFont('Helvetica');
            doc5.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          } else {
            doc5.text(this.autorActual.proyecto, 4.2, 8, { align: 'center' });
            doc5.setFontSize(14);

            doc5.setFont('Helvetica');
            doc5.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          }
        }
        break;
      case '7':
        const doc6 = new jsPDF('p', 'in', 'letter');
        doc6.addImage('assets/image/ConstanciaParticipantesVictoria.jpg', 'jpg', 0, 0, 8.5, 11).setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc6.text(this.titlecasePipe.transform(this.autorActual.nombre) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_pat) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_mat), 4.2, 6.9, { align: 'center' }).setFontSize(20).setFont('Helvetica').setTextColor('#646464');
        if (this.autorActual.proyecto.length >= 30 && this.autorActual.proyecto.length <= 100) {
          const nombreTemp = this.autorActual.proyecto.substr(0, 50);
          const nombreTemp2 = this.autorActual.proyecto.substr(50, this.autorActual.proyecto.length);
          doc6.text('', 0, 0).setFontSize(14);
          doc6.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc6.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc6.setFontSize(14);
          doc6.addImage('assets/image/DirectorGeneral.png', 'png', 1.5, 7.9, 1.4, 1.4);
          doc6.addImage('assets/image/DirectorVictoria.png', 'png', 5.7, 8.2, 1.4, 1.1);
          doc6.setFont('Helvetica');
          doc6.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
        } else {
          if (this.autorActual.proyecto.length > 100) {
            const nombreTemp = this.autorActual.proyecto.substr(0, 50);
            const nombreTemp2 = this.autorActual.proyecto.substr(50, 50);
            const nombreTemp3 = this.autorActual.proyecto.substr(100, this.autorActual.proyecto.length);
            doc6.text('', 0, 0).setFontSize(14);
            doc6.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc6.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc6.text(nombreTemp3, 4.2, 8.50, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc6.addImage('assets/image/DirectorGeneral.png', 'png', 1.5, 7.9, 1.4, 1.4);
            doc6.addImage('assets/image/DirectorVictoria.png', 'png', 5.7, 8.2, 1.4, 1.1);
            doc6.setFont('Helvetica');
            doc6.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          } else {
            doc6.text(this.autorActual.proyecto, 4.2, 8, { align: 'center' });
            doc6.setFontSize(14);
            doc6.addImage('assets/image/DirectorGeneral.png', 'png', 1.5, 7.9, 1.4, 1.4);
            doc6.addImage('assets/image/DirectorVictoria.png', 'png', 5.7, 8.2, 1.4, 1.1);
            doc6.setFont('Helvetica');
            doc6.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          }
        }
        break;
      case '8':
        const doc7 = new jsPDF('p', 'in', 'letter');
        doc7.addImage('assets/image/ConstanciaParticipantesEstatal.jpg', 'jpg', 0, 0, 8.5, 11).setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc7.text(this.titlecasePipe.transform(this.autorActual.nombre) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_pat) + ' ' + this.titlecasePipe.transform(this.autorActual.ape_mat), 4.2, 6.6, { align: 'center' }).setFontSize(20).setFont('Helvetica').setTextColor('#646464');
        if (this.autorActual.proyecto.length >= 30 && this.autorActual.proyecto.length <= 100) {
          const nombreTemp = this.autorActual.proyecto.substr(0, 50);
          const nombreTemp2 = this.autorActual.proyecto.substr(50, this.autorActual.proyecto.length);
          doc7.text('', 0, 0).setFontSize(14);
          doc7.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc7.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
          doc7.setFontSize(14);
          doc7.addImage('assets/image/DirectorGeneral.png', 'png', 3.45, 7.9, 1.7, 1.7);
          doc7.setFont('Helvetica');
          doc7.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
        } else {
          if (this.autorActual.proyecto.length > 100) {
            const nombreTemp = this.autorActual.proyecto.substr(0, 50);
            const nombreTemp2 = this.autorActual.proyecto.substr(50, 50);
            const nombreTemp3 = this.autorActual.proyecto.substr(100, this.autorActual.proyecto.length);
            doc7.text('', 0, 0).setFontSize(14);
            doc7.text(nombreTemp, 4.2, 8, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc7.text(nombreTemp2, 4.2, 8.25, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc7.text(nombreTemp3, 4.2, 8.50, { align: 'center' }).setFontSize(14).setFont('Helvetica').setTextColor('#646464');
            doc7.addImage('assets/image/DirectorGeneral.png', 'png', 3.45, 7.9, 1.7, 1.7);
            doc7.setFont('Helvetica');
            doc7.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          } else {
            doc7.text(this.autorActual.proyecto, 4.2, 8, { align: 'center' });
            doc7.setFontSize(14);
            doc7.addImage('assets/image/DirectorGeneral.png', 'png', 3.45, 7.9, 1.7, 1.7);
            doc7.setFont('Helvetica');
            doc7.save('Constancia Autor ' + this.autorActual.nombre + '_' + this.autorActual.ape_pat + '_' + this.autorActual.ape_mat + '.pdf');
          }
        }
        break;
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
