import { Component, OnInit } from '@angular/core';
import { Session } from '../../../models/session.model';
import { forkJoin } from 'rxjs';
import { CoordinadorService } from '../../../services/coordinador.service';
import { UtilService } from '../../../services/util.service';
import { SedesService } from '../../../services/sedes.service';
import { JudgesRegistered } from '../../../models/judges.model';
import { Sedes } from '../../../models/sedes.model';
import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-registered',
  templateUrl: './admin-registered.component.html',
  styleUrls: ['./admin-registered.component.scss']
})
export class AdminRegisteredComponent implements OnInit {


  sessionData: Session;
  superUser: boolean;
  admins: JudgesRegistered[];
  adminActual: JudgesRegistered;
  sedes: Sedes[];
  formAdmin: FormGroup;
  adminsFiltro: JudgesRegistered[];
  categoriaActual = '1';
  sedeActual = '1';

  constructor(
    private adminsService: CoordinadorService,
    private utilService: UtilService,
    private sedesService: SedesService,
    private formBuilder: FormBuilder,
  ) { 
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.admins = new Array<JudgesRegistered>();
    this.utilService.loading = true;
    this.formAdmin = this.formBuilder.group({
      id_jueces:            [''],
      id_categorias:        ['', [Validators.required]],
      id_sedes:             ['', [Validators.required]],
      usuario:              ['', [Validators.required]],
      contrasena:           ['', [Validators.required]],
      ids_proyectos_viejos: [''],
      ids_proyectos_nuevos: [''],
      nombre:               ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.sessionData.rol === 'superuser') {
      this.superUser = false;
    } else {
      this.superUser = true;
    }
    if (this.sessionData.rol === 'superuser') {
      forkJoin({
        jueces: this.adminsService.getAdminSueperUser(),
        sedes: this.sedesService.getSedes(),
      }).subscribe(
        data => {
          this.admins = data.jueces;
          console.log(data.jueces);
          console.log(data);
          this.sedes = data.sedes;
        },
        err => {
          console.log(err);
        }
      ).add(() => {
        this.utilService.loading = false;
      });
    } 
    
    // else {
    //   forkJoin({
    //     jueces: this.judgesService.getJudgesDetails(),
    //     sedes: this.sedesService.getSedes(),
    //   }).subscribe(
    //     data => {
    //       this.jueces = data.jueces;
    //       this.sedes = data.sedes;
    //     },
    //     err => {
    //       console.log(err);
    //     }
    //   ).add(() => {
    //     this.utilService.loading = false;
    //   });
    // }
  }
  setJudge(admin: JudgesRegistered) {
    this.adminActual = admin;
  }
  deleteJudge() {
    this.utilService._loading = true;
    this.adminsService.deleteAdmin(this.adminActual.id_jueces)
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

  // open(juez: JudgesRegistered) {
  //   this.adminActual = juez;
  //   this.utilService._loading = true;
  //   forkJoin({
  //     proyectos: this.superUser
  //     ? this.proyectosService.obtenerTodosLosProyectosCategoria(this.adminActual.id_categorias)
  //     : this.proyectosService.obtenerProyectosSuperUser(this.adminActual.id_categorias),
  //     proyectosViejos: this.proyectosService.obtenerProyectosSelect(this.adminActual.id_categorias)
  //   }).subscribe(
  //     data => {
  //       this.proyectos = data.proyectos;
  //       this.proyectosViejos = data.proyectosViejos;
  //     }
  //   ).add(() => this.utilService._loading = false);
  //   this.superUser
  //   ? this.formAdmin.patchValue({
  //     id_jueces: this.adminActual.id_jueces,
  //     usuario: this.adminActual.usuario,
  //     contrasena: this.adminActual.contrasena,
  //     nombre: this.adminActual.nombre,
  //     id_sedes: this.sessionData.id_sedes,
  //     id_categorias: this.verificarCat(this.adminActual.categoria)
  //   })
  //   : this.formAdmin.patchValue({
  //     id_jueces: this.adminActual.id_jueces,
  //     usuario: this.adminActual.usuario,
  //     contrasena: this.adminActual.contrasena,
  //     nombre: this.adminActual.nombre,
  //     id_sedes: this.adminActual.id_sedes,
  //     id_categorias: this.verificarCat(this.adminActual.categoria)
  //   });
  //   this.swalEdit.fire().then(
  //     res => {
  //       if (res.dismiss === Swal.DismissReason.backdrop) {
  //         this.vaciarInfo();
  //       }
  //     },
  //     err => {
  //       console.error(err);
  //     }
  //   );
  // }
  // vaciarInfo() {
  //   this.proyectosNuevos = [];
  //   this.proyectosViejos = [];
  //   this.proyectos = [];
  // }
  editarJuez() {
    this.utilService._loading = true;
    this.adminsService.updateJudge(this.formAdmin.value)
      .subscribe(data => {
        Swal.fire({
          icon: 'success',
          title: data,
        });
        this.ngOnInit();
        // this.vaciarInfo();
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
  // dropProyectoViejo(item) {
  //   this.proyectosViejos.map( (res, index) => {
  //     if (res.id_proyectos === item.id_proyectos) {
  //       this.proyectosViejos.splice(index, 1);
  //     }
  //   });
  // }
  // addProyectoViejo(item) {
  //   this.proyectosViejos.push(item);
  // }
  // dropProyectoNuevo(item) {
  //   this.proyectosNuevos.map( (res, index) => {
  //     if (res.id_proyectos === item.id_proyectos) {
  //       this.proyectosNuevos.splice(index, 1);
  //     }
  //   });
  // }
  // addProyectoNuevo(item) {
  //   this.proyectosNuevos.push(item);
  // }
  onChangeSedeActual(value) {
    this.utilService._loading = true;
    this.sedeActual = value;
    // this.proyectosService.obtenerProyectosSuperUserTemp(this.categoriaActual, value)
    // .subscribe( data => {
    //   this.proyectos = data;
    // }).add(() => this.utilService._loading = false);
  }
  onChangeCategoriaActual(value) {
    this.utilService._loading = true;
    this.categoriaActual = value;
    if (this.sessionData.rol === 'superuser') {
      // this.proyectosService.obtenerProyectosSuperUserTemp(value, this.sedeActual)
      // .subscribe( data => {
      //   this.proyectos = data;
      // }).add(() => this.utilService._loading = false);
    } else {
      // this.proyectosService.obtenerTodosLosProyectosCategoria(value)
      // .subscribe( data => {
      //   this.proyectos = data;
      // }).add(() => this.utilService._loading = false);
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
  // saveAsPdf(juez: JudgesRegistered) {
  //   this.juezActual = juez;
  //   switch (this.juezActual.sede) {
  //     case 'El mante':
  //       const doc = new jsPDF('p', 'in', 'letter');
  //       doc.addImage('assets/image/ReconocimientoJuradoMante.jpg', 'jpg', 0, 0, 8.5, 11)
  //       .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
  //       doc.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.6, {align: 'center'});
  //       // doc.addImage('assets/image/DirectorGeneral.png', 'png', 1.8, 7.8, 1.3, 1.3);
  //       // doc.addImage('assets/image/DirectorMante.png', 'png', 5.7, 8, 1.3, 1);
  //       doc.save('constancia Juez ' + this.juezActual.nombre + '.pdf');
  //       break;
  //     case 'Reynosa':
  //       const doc1 = new jsPDF('p', 'in', 'letter');
  //       doc1.addImage('assets/image/ReconocimientoJuradoReynosa.jpg', 'jpg', 0, 0, 8.5, 11)
  //       .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
  //       doc1.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.6, {align: 'center'});
  //       // doc1.addImage('assets/image/DirectorReynosa.png', 'png', 5.7, 7.8, 1.3, 1.3);
  //       // doc1.addImage('assets/image/DirectorGeneral.png', 'png', 1.8, 7.8, 1.3, 1.3);
  //       doc1.save('constancia Juez ' + this.juezActual.nombre + '.pdf');
  //       break;
  //     case 'Matamoros':
  //       const doc2 = new jsPDF('p', 'in', 'letter');
  //       doc2.addImage('assets/image/ReconocimientoJuradoMatamoros.jpg', 'jpg', 0, 0, 8.5, 11)
  //       .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
  //       doc2.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.6, {align: 'center'});
  //       // doc2.addImage('assets/image/DirectorMatamoros.png', 'png', 5.7, 8, 1.3, 1);
  //       // doc2.addImage('assets/image/DirectorGeneral.png', 'png', 1.8, 7.8, 1.3, 1.3);
  //       doc2.save('constancia Juez ' + this.juezActual.nombre + '.pdf');
  //       break;
  //     case 'Madero':
  //       const doc3 = new jsPDF('p', 'in', 'letter');
  //       doc3.addImage('assets/image/ReconocimientoJuradoMadero.jpg', 'jpg', 0, 0, 8.5, 11)
  //       .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
  //       doc3.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.6, {align: 'center'});
  //       doc3.save('constancia Juez ' + this.juezActual.nombre + '.pdf');
  //       break;
  //     case 'Jaumave':
  //       const doc4 = new jsPDF('p', 'in', 'letter');
  //       doc4.addImage('assets/image/ReconocimientoJuradoJaumave.jpg', 'jpg', 0, 0, 8.5, 11)
  //       .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
  //       doc4.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.73, {align: 'center'});
  //       doc4.save('constancia Juez ' + this.juezActual.nombre + '.pdf');
  //       break;
  //     case 'Nuevo Laredo':
  //       const doc5 = new jsPDF('p', 'in', 'letter');
  //       doc5.addImage('assets/image/ReconocimientoJuradoNuevoLaredo.jpg', 'jpg', 0, 0, 8.5, 11)
  //       .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
  //       doc5.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.6, {align: 'center'});
  //       doc5.save('constancia Juez ' + this.juezActual.nombre + '.pdf');
  //       break;
  //     case 'Victoria':
  //       const doc6 = new jsPDF('p', 'in', 'letter');
  //       doc6.addImage('assets/image/ReconocimientoJuradoVictoria.jpg', 'jpg', 0, 0, 8.5, 11)
  //       .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
  //       doc6.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.6, {align: 'center'});
  //       // doc6.addImage('assets/image/DirectorGeneral.png', 'png', 1.8, 7.8, 1.3, 1.3);
  //       // doc1.addImage('assets/image/DirectorVictoria.png', 'png', 5.7, 8, 1.3, 1);
  //       doc6.save('constancia Juez ' + this.juezActual.nombre + '.pdf');
  //       break;
  //     case 'Estatal':
  //       const doc7 = new jsPDF('p', 'in', 'letter');
  //       doc7.addImage('assets/image/ReconocimientoJuradoEstatal.jpg', 'jpg', 0, 0, 8.5, 11)
  //       .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
  //       doc7.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.6, {align: 'center'});
  //       doc7.addImage('assets/image/DirectorGeneral.png', 'png', 3.45, 7.6, 1.7, 1.7);
  //       // doc1.addImage('assets/image/DirectorVictoria.png', 'png', 5.7, 8, 1.3, 1);
  //       doc7.save('Constancia Juez Estatal' + this.juezActual.nombre + '.pdf');
  //       break;
  //     case 'Internacional':
  //       const doc8 = new jsPDF('p', 'in', 'letter');
  //       if (this.sessionData.id_sedes === '9' && this.juezActual.categoria === 'superior') {
  //       doc8.addImage('assets/image/ReconocimientoJuradoInternacionalSuperior.jpg', 'jpg', 0, 0, 8.5, 11)
  //       .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
  //       doc8.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.6, {align: 'center'});
  //       doc8.addImage('assets/image/DirectorGeneral.png', 'png', 3.45, 7.9, 1.7, 1.7);
  //       // doc1.addImage('assets/image/DirectorVictoria.png', 'png', 5.7, 8, 1.3, 1);
  //       doc8.save('Constancia Juez Estatal' + this.juezActual.nombre + '.pdf');
  //       } else {
  //         if (this.sessionData.id_sedes === '9' && this.juezActual.categoria === 'media superior') {
  //           doc8.addImage('assets/image/ReconocimientoJuradoInternacionalMS.jpg', 'jpg', 0, 0, 8.5, 11)
  //           .setFont('Helvetica').setFontSize(28).setTextColor('#646464');
  //           doc8.text(this.titlecasePipe.transform(this.juezActual.nombre), 4.2, 6.6, {align: 'center'});
  //           doc8.addImage('assets/image/DirectorGeneral.png', 'png', 3.45, 7.9, 1.7, 1.7);
  //           // doc1.addImage('assets/image/DirectorVictoria.png', 'png', 5.7, 8, 1.3, 1);
  //           doc8.save('Constancia Juez Estatal' + this.juezActual.nombre + '.pdf');
  //         } else {
  //           swal.fire({
  //             title: 'No se encontro la constancia',
  //             icon: 'error',
  //           });
  //         }
  //       }
  //       break;
  //     default:
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'No se encontr?? la sede'
  //       });
  //       break;
  //   }
  // }

  onChangeSedeActualFiltro(idSede: string) {
    if (idSede !== 'todo') {
      const juecesTemp: JudgesRegistered[] = [];
      this.adminsFiltro.forEach((value, _) => {
        if (value.id_sedes === idSede) {
          juecesTemp.push(value);
        }
      });
      this.admins = juecesTemp;
    } else {
      this.admins = this.adminsFiltro;
    }
  }

}
