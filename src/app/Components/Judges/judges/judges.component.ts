import { Component, OnInit, ViewChild } from '@angular/core';
import { JudgesRegisteredService } from '../../../services/judges.service';
import { JudgesRegistered } from '../../../models/judges.model';
import { UtilService } from '../../../services/util.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Sedes } from '../../../models/sedes.model';
import { SedesService } from '../../../services/sedes.service';
import { forkJoin } from 'rxjs';
import { Session } from '../../../models/session.model';
import { jsPDF } from 'jspdf';
import '../../../../assets/cotacytResources/fonts/Helvetica.ttf';
import { Proyectos, ProyectSelect } from '../../../models/proyectos.model';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ProyectosService } from '../../../services/proyectos.service';
import { TitleCasePipe } from '@angular/common';
import swal from 'sweetalert2';



@Component({
  selector: 'app-judges',
  templateUrl: './judges.component.html',
  styleUrls: ['./judges.component.scss']
})
export class JudgesComponent implements OnInit {

  @ViewChild('swalid') private swalEdit: SwalComponent;
  jueces: JudgesRegistered[];
  juecesFiltro: JudgesRegistered[];
  juezActual: JudgesRegistered;
  sedes: Sedes[];
  formJuez: FormGroup;
  sessionData: Session;
  proyectos: Proyectos[];
  proyectosViejos: ProyectSelect[];
  proyectosNuevos: Proyectos[];
  settingsProyectosViejos: IDropdownSettings;
  settingsProyectosNuevos: IDropdownSettings;
  superUser: boolean;
  categoriaActual = '1';
  sedeActual = '1';
  constructor(
    private judgesService: JudgesRegisteredService,
    private utilService: UtilService,
    private sedesService: SedesService,
    private proyectosService: ProyectosService,
    private formBuilder: FormBuilder,
    private titlecasePipe: TitleCasePipe
  ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.jueces = new Array<JudgesRegistered>();
    this.proyectosNuevos = new Array<any>();
    this.proyectosViejos = new Array<any>();
    this.utilService.loading = true;
    this.formJuez = this.formBuilder.group({
      id_jueces: [''],
      id_categorias: ['', [Validators.required]],
      id_sedes: ['', [Validators.required]],
      usuario: ['', [Validators.required]],
      contrasena: ['', [Validators.required]],
      ids_proyectos_viejos: [''],
      ids_proyectos_nuevos: [''],
      nombre: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.sessionData.rol === 'superuser') {
      this.superUser = false;
    } else {
      this.superUser = true;
    }
    this.settingsProyectosViejos = {
      singleSelection: false,
      idField: 'id_proyectos',
      textField: 'nombre',
      allowSearchFilter: true,
      selectAllText: 'Seleccionar todo',
      noDataAvailablePlaceholderText: 'No hay proyectos',
      searchPlaceholderText: 'Buscar',
      unSelectAllText: 'Deseleccionar todo',
    };
    this.settingsProyectosNuevos = {
      singleSelection: false,
      idField: 'id_proyectos',
      textField: 'nombre',
      allowSearchFilter: true,
      selectAllText: 'Seleccionar todo',
      noDataAvailablePlaceholderText: 'No hay proyectos',
      searchPlaceholderText: 'Buscar',
      unSelectAllText: 'Deseleccionar todo',
    };
    if (this.sessionData.rol === 'superuser') {
      forkJoin({
        jueces: this.judgesService.getJudgesSueperUser(),
        sedes: this.sedesService.getSedes(),
        proyectos: this.proyectosService.obtenerProyectosSuperUser('1'),
      }).subscribe(
        data => {
          this.jueces = data.jueces;
          this.sedes = data.sedes;
          this.juecesFiltro = this.jueces;
          this.proyectos = data.proyectos;
        },
        err => {
          console.log(err);
        }
      ).add(() => {
        this.utilService.loading = false;
      });
    } else {
      forkJoin({
        jueces: this.judgesService.getJudgesDetails(),
        sedes: this.sedesService.getSedes(),
      }).subscribe(
        data => {
          this.jueces = data.jueces;
          this.sedes = data.sedes;
        },
        err => {
          console.log(err);
        }
      ).add(() => {
        this.utilService.loading = false;
      });
    }
  }
  setJudge(juez: JudgesRegistered) {
    this.juezActual = juez;
  }
  deleteJudge() {
    this.utilService._loading = true;
    this.judgesService.deleteJudges(this.juezActual.id_jueces)
      .subscribe(data => {
        Swal.fire({
          title: 'Se elimino correctamente',
          icon: 'success',
        });
      },
        err => {
          console.log(err);
          Swal.fire({
            title: 'Ocurrio un error al eliminar',
            icon: 'error',
          });
        }).add(() => {
          this.utilService._loading = false;
          this.ngOnInit();
        });
  }
  open(juez: JudgesRegistered) {
    this.juezActual = juez;
    this.utilService._loading = true;
    forkJoin({
      proyectos: this.superUser
        ? this.proyectosService.obtenerTodosLosProyectosCategoria(this.juezActual.id_categorias)
        : this.proyectosService.obtenerProyectosSuperUser(this.juezActual.id_categorias),
      proyectosViejos: this.proyectosService.obtenerProyectosSelect(this.juezActual.id_jueces)
    }).subscribe(
      data => {
        this.proyectos = data.proyectos;
        for (let index = 0; index < data.proyectos.length; index++) {
          for (const i of Object.keys(data.proyectosViejos)) {
            if (data.proyectosViejos[i].id_proyectos === data.proyectos[index].id_proyectos) {
              console.log('se elimino', data.proyectos[index].id_proyectos);
              this.proyectos.splice(this.proyectos.indexOf(data.proyectos[index]), 1);
              index--;
              break;
            }
          }
        }
        this.proyectosViejos = data.proyectosViejos;
      }
    ).add(() => this.utilService._loading = false);
    this.superUser
      ? this.formJuez.patchValue({
        id_jueces: this.juezActual.id_jueces,
        usuario: this.juezActual.usuario,
        contrasena: this.juezActual.contrasena,
        nombre: this.juezActual.nombre,
        id_sedes: this.sessionData.id_sedes,
        id_categorias: this.juezActual.id_categorias
      })
      : this.formJuez.patchValue({
        id_jueces: this.juezActual.id_jueces,
        usuario: this.juezActual.usuario,
        contrasena: this.juezActual.contrasena,
        nombre: this.juezActual.nombre,
        id_sedes: this.juezActual.id_sedes,
        id_categorias: this.juezActual.id_categorias
      });
    this.swalEdit.fire().then(
      res => {
        if (res.dismiss === Swal.DismissReason.backdrop) {
          console.log('se vacio');
          this.vaciarInfo();
        }
      },
      err => {
        console.error(err);
      }
    );
  }
  vaciarInfo() {
    this.formJuez.get('ids_proyectos_viejos').setValue([]);
    this.formJuez.get('ids_proyectos_nuevos').setValue([]);
    this.proyectosNuevos = [];
    this.proyectosViejos = [];
    this.proyectos = [];
  }
  editarJuez() {
    this.utilService._loading = true;
    this.judgesService.updateJudge(this.formJuez.value)
      .subscribe(data => {
        Swal.fire({
          icon: 'success',
          title: data,
        });
        this.ngOnInit();
        this.vaciarInfo();
      },
        err => {
          console.log(err);
          Swal.fire({
            title: 'Ocurrio un error',
            icon: 'error'
          });
        }).add(() => {
          this.utilService._loading = false;
        });
  }
  dropProyectoViejo(item) {
    this.proyectosViejos.map((res, index) => {
      if (res.id_proyectos === item.id_proyectos) {
        this.proyectosViejos.splice(index, 1);
      }
    });
  }
  addProyectoViejo(item) {
    this.proyectosViejos.push(item);
  }
  dropProyectoNuevo(item) {
    this.proyectosNuevos.map((res, index) => {
      if (res.id_proyectos === item.id_proyectos) {
        this.proyectosNuevos.splice(index, 1);
      }
    });
  }
  addProyectoNuevo(item) {
    this.proyectosNuevos.push(item);
  }
  onChangeSedeActual(value) {
    this.utilService._loading = true;
    this.sedeActual = value;
    this.proyectosService.obtenerProyectosSuperUserTemp(this.categoriaActual, value)
      .subscribe(data => {
        this.proyectos = data;
      }).add(() => this.utilService._loading = false);
  }
  onChangeCategoriaActual(value) {
    this.utilService._loading = true;
    this.categoriaActual = value;
    if (this.sessionData.rol === 'superuser') {
      this.proyectosService.obtenerProyectosSuperUserTemp(value, this.sedeActual)
        .subscribe(data => {
          this.proyectos = data;
        }).add(() => this.utilService._loading = false);
    } else {
      this.proyectosService.obtenerTodosLosProyectosCategoria(value)
        .subscribe(data => {
          this.proyectos = data;
        }).add(() => this.utilService._loading = false);
    }
  }
  verificarCat(categoria: string) {
    switch (categoria) {
      case 'petit':
        return 1;
      case 'kids':
        return 2;
      case 'juvenil':
        return 3;
      case 'media superior':
        return 4;
      case 'superior':
        return 5;
      case 'posgrado':
        return 6;
    }
  }
  saveAsPdf(juez: JudgesRegistered) {
    this.juezActual = juez;
    switch (this.juezActual.sede) {
      case 'El Mante':
        const doc = new jsPDF('p', 'in', 'letter');
        doc.addImage('assets/cotacytResources/image/reconocimientoJurado/ReconocimientoJuradoMante.jpg', 'jpg', 0, 0, 8.5, 11)
        .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.3, {align: 'center'});
        // doc.addImage('assets/cotacytResources/image/DirectorGeneral.png', 'png', 1.8, 7.8, 1.3, 1.3);
        // doc.addImage('assets/cotacytResources/image/DirectorMante.png', 'png', 5.7, 8, 1.3, 1);
        doc.save('constancia Juez ' + this.juezActual.nombre + '.pdf');
        break;
      case 'Reynosa':
        const doc1 = new jsPDF('p', 'in', 'letter');
        doc1.addImage('assets/cotacytResources/image/reconocimientoJurado/ReconocimientoJuradoReynosa.jpg', 'jpg', 0, 0, 8.5, 11)
        .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc1.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.3, {align: 'center'});
        // doc1.addImage('assets/cotacytResources/image/DirectorReynosa.png', 'png', 5.7, 7.8, 1.3, 1.3);
        // doc1.addImage('assets/cotacytResources/image/DirectorGeneral.png', 'png', 1.8, 7.8, 1.3, 1.3);
        doc1.save('constancia Juez ' + this.juezActual.nombre + '.pdf');
        break;
      case 'Matamoros':
        const doc2 = new jsPDF('p', 'in', 'letter');
        doc2.addImage('assets/cotacytResources/image/reconocimientoJurado/ReconocimientoJuradoMatamoros.jpg', 'jpg', 0, 0, 8.5, 11)
        .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc2.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6, {align: 'center'});
        // doc2.addImage('assets/cotacytResources/image/DirectorMatamoros.png', 'png', 5.7, 8, 1.3, 1);
        // doc2.addImage('assets/cotacytResources/image/DirectorGeneral.png', 'png', 1.8, 7.8, 1.3, 1.3);
        doc2.save('constancia Juez ' + this.juezActual.nombre + '.pdf');
        break;
      case 'Madero':
        const doc3 = new jsPDF('p', 'in', 'letter');
        doc3.addImage('assets/cotacytResources/image/reconocimientoJurado/ReconocimientoJuradoMadero.jpg', 'jpg', 0, 0, 8.5, 11)
        .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc3.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.3, {align: 'center'});
        doc3.save('constancia Juez ' + this.juezActual.nombre + '.pdf');
        break;
      case 'Nuevo Laredo':
        const doc5 = new jsPDF('p', 'in', 'letter');
        doc5.addImage('assets/cotacytResources/image/reconocimientoJurado/ReconocimientoJuradoNuevoLaredo.jpg', 'jpg', 0, 0, 8.5, 11)
        .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc5.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.3, {align: 'center'});
        doc5.save('constancia Juez ' + this.juezActual.nombre + '.pdf');
        break;
      case 'Victoria':
        const doc6 = new jsPDF('p', 'in', 'letter');
        doc6.addImage('assets/cotacytResources/image/reconocimientoJurado/ReconocimientoJuradoVictoria.jpg', 'jpg', 0, 0, 8.5, 11)
        .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc6.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.3, {align: 'center'});
        // doc6.addImage('assets/cotacytResources/image/DirectorGeneral.png', 'png', 1.8, 7.8, 1.3, 1.3);
        // doc1.addImage('assets/cotacytResources/image/DirectorVictoria.png', 'png', 5.7, 8, 1.3, 1);
        doc6.save('constancia Juez ' + this.juezActual.nombre + '.pdf');
        break;
      case 'Estatal':
        const doc7 = new jsPDF('p', 'in', 'letter');
        doc7.addImage('assets/cotacytResources/image/reconocimientoJurado/ReconocimientoJuradoEstatal.jpg', 'jpg', 0, 0, 8.5, 11)
        .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc7.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.35, {align: 'center'});
        //doc7.addImage('assets/cotacytResources/image/DirectorGeneral.png', 'png', 3.45, 7.6, 1.7, 1.7);
        // doc1.addImage('assets/cotacytResources/image/DirectorVictoria.png', 'png', 5.7, 8, 1.3, 1);
        doc7.save('Constancia Juez Estatal' + this.juezActual.nombre + '.pdf');
        break;
      case 'Internacional':
        const doc8 = new jsPDF('p', 'in', 'letter');
        if (this.sessionData.id_sedes === '9' && this.juezActual.categoria === 'superior') {
        doc8.addImage('assets/cotacytResources/image/reconocimientoJurado/ReconocimientoJuradoInternacionalSuperior.jpg', 'jpg', 0, 0, 8.5, 11)
        .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
        doc8.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.3, {align: 'center'});
        //doc8.addImage('assets/cotacytResources/image/DirectorGeneral.png', 'png', 3.45, 7.9, 1.7, 1.7);
        // doc1.addImage('assets/cotacytResources/image/DirectorVictoria.png', 'png', 5.7, 8, 1.3, 1);
        doc8.save('Constancia Juez Internacional' + this.juezActual.nombre + '.pdf');
        } else {
          if (this.sessionData.id_sedes === '9' && this.juezActual.categoria === 'media superior') {
            doc8.addImage('assets/cotacytResources/image/reconocimientoJurado/ReconocimientoJuradoInternacionalMS.jpg', 'jpg', 0, 0, 8.5, 11)
            .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
            doc8.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.3, {align: 'center'});
            //doc8.addImage('assets/cotacytResources/image/DirectorGeneral.png', 'png', 3.45, 7.9, 1.7, 1.7);
            // doc1.addImage('assets/cotacytResources/image/DirectorVictoria.png', 'png', 5.7, 8, 1.3, 1);
            doc8.save('Constancia Juez Internacional' + this.juezActual.nombre + '.pdf');
          } else {
            swal.fire({
              title: 'No se encontro la constancia',
              icon: 'error',
            });
          }
        }
        break;
      default:
        Swal.fire({
          icon: 'error',
          title: 'No se encontr?? la sede'
        });
        break;
    }
  }

  onChangeSedeActualFiltro(idSede: string) {
    if (idSede !== 'todo') {
      const juecesTemp: JudgesRegistered[] = [];
      this.juecesFiltro.forEach((value, _) => {
        if (value.id_sedes === idSede) {
          juecesTemp.push(value);
        }
      });
      this.jueces = juecesTemp;
    } else {
      this.jueces = this.juecesFiltro;
    }
  }
}

