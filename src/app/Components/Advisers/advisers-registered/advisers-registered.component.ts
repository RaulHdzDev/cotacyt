import { Component, OnInit, ViewChild } from '@angular/core';
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
  sessionData: Session;
  sedes: Sedes[];
  superUser: boolean;
  constructor(
    private asesoresService: AsesoresService,
    private utilService: UtilService,
    private sedesService: SedesService,
    private formBuilder: FormBuilder,
    private titlecasePipe: TitleCasePipe
  ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.utilService.loading = true;
    this.formAsesores = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      ape_pat: ['', [Validators.required]],
      ape_mat: [''],
      email: ['', [Validators.required, Validators.email]],
      id_sedes: this.sessionData.id_sedes,
      descripcion: ['', [Validators.required]],
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
      sedes: this.sedesService.getSedes()
    }).subscribe(
      data => {
        this.asesores = data.asesores;
        this.sedes = data.sedes;
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
    this.asesorActual = asesor;
    this.formAsesores.patchValue({
      nombre: asesor.nombre,
      ape_pat: asesor.ape_pat,
      ape_mat: asesor.ape_mat,
      email: asesor.email,
      id_sedes: this.sessionData.id_sedes,
      descripcion: asesor.descripcion,
    });
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
          + this.titlecasePipe.transform(this.asesorActual.ape_mat), 4.2, 6, { align: 'center' })
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
          + this.titlecasePipe.transform(this.asesorActual.ape_mat), 4.2, 6, { align: 'center' })
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
