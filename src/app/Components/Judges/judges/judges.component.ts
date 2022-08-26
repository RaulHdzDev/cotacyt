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
  jueces: Array<JudgesRegistered> = [];
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
  categoriaActual = 'petit';
  sedeActual = 'el mante';
  juecesTabla: JudgesRegistered[] = [];
  rowPerPage = 10;
  currentPage = 1;
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
      idField: 'id',
      textField: 'titulo',
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
        this.juecesTabla = [];
        for (let i = 0; i < this.rowPerPage; i++) {
          if (this.jueces[i]) {
            this.juecesTabla.push(this.jueces[i]);
          }
        }
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
        this.juecesTabla = [];
        for (let i = 0; i < this.rowPerPage; i++) {
          if (this.jueces[i]) {
            this.juecesTabla.push(this.jueces[i]);
          }
        }
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
        ? this.proyectosService.getProjectsCatSede(this.juezActual.sede, this.juezActual.categoria)
        : this.proyectosService.getProjectsCatSede(this.sessionData.sede, this.juezActual.categoria),
      proyectosViejos: this.proyectosService.obtenerProyectosSelect(this.juezActual.id_jueces)
    }).subscribe(
      data => {
        this.proyectos = data.proyectos.data;
        for (let index = 0; index < data.proyectos.data.length; index++) {
          for (const i of Object.keys(data.proyectosViejos)) {
            if (data.proyectosViejos[i].id_proyectos === data.proyectos[index].data.id_proyectos) {
              console.log('se elimino', data.proyectos[index].data.id_proyectos);
              this.proyectos.splice(this.proyectos.indexOf(data.proyectos[index].data), 1);
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
  nextPage(): void {
    const total = Math.round(this.jueces.length / this.rowPerPage) < (this.jueces.length / this.rowPerPage)
      ? Math.round(this.jueces.length / this.rowPerPage) + 1
      : Math.round(this.jueces.length / this.rowPerPage);
    if (this.currentPage < total) {
      this.juecesTabla = [];
      for (let i = this.currentPage * this.rowPerPage; i < this.jueces.length; i++) {
        if (i <= (this.currentPage * this.rowPerPage) + this.rowPerPage) {
          this.juecesTabla.push(this.jueces[i]);
        }
      }
      this.currentPage++;
    }
  }
  previousPage(): void {
    if (this.currentPage > 1) {
      this.juecesTabla = [];
      this.currentPage--;
      for (let i = (this.currentPage * this.rowPerPage) - this.rowPerPage; i < this.jueces.length; i++) {
        if (i <= ((this.currentPage * this.rowPerPage) + this.rowPerPage) - this.rowPerPage) {
          this.juecesTabla.push(this.jueces[i]);
        }
      }
    }
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
      if (res.id_proyectos === item.id) {
        this.proyectosNuevos.splice(index, 1);
      }
    });
  }
  addProyectoNuevo(item) {
    this.proyectosNuevos.push(item);
  }
  onChangesedeActual(value) {
    this.utilService._loading = true;
    switch (value) {
      case '1':
        this.sedeActual = 'el mante';
        break;
      case '2':
        this.sedeActual = 'reynosa';
        break;
      case '3':
        this.sedeActual = 'matamoros';
        break;
      case '4':
        this.sedeActual = 'madero';
        break;
      case '5':
        this.sedeActual = 'nuevo laredo';
        break;
      case '6':
        this.sedeActual = 'victoria';
        break;
      case '7':
        this.sedeActual = 'estatal';
        break;
      case '8':
        this.sedeActual = 'internacional';
        break;
    }
    this.proyectosService.getProjectsCatSede(this.sedeActual, this.categoriaActual)
      .subscribe(data => {
        this.proyectos = data.data;
      }).add(() => this.utilService._loading = false);
  }
  onChangecategoriaActual(value) {
    this.utilService._loading = true;
    switch (value) {
      case '1':
        this.categoriaActual = 'petit';
        break;
      case '2':
        this.categoriaActual = 'kids';
        break;
      case '3':
        this.categoriaActual = 'juvenil';
        break;
      case '4':
        this.categoriaActual = 'Media superior';
        break;
      case '5':
        this.categoriaActual = 'superior';
        break;
      case '6':
        this.categoriaActual = 'posgrado';
        break;
    }
    if (this.sessionData.rol === 'superuser') {
      this.proyectosService.getProjectsCatSede(this.sedeActual, this.categoriaActual)
        .subscribe(data => {
          this.proyectos = data.data;
        }).add(() => this.utilService._loading = false);
    } else {
      this.proyectosService.getProjectsCatSede(this.sessionData.sede, this.categoriaActual)
        .subscribe(data => {
          this.proyectos = data.data;
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
  onChangeSedeActualFiltro(value: string) {
    this.jueces = this.juecesFiltro;
    if (value !== 'todo') {
      const juecesTemp: JudgesRegistered[] = [];
      this.jueces.forEach((autor, _) => {
        if (autor.sede.toLowerCase() === value.toLowerCase()) {
          juecesTemp.push(autor);
        }
      });
      this.jueces = juecesTemp;
    } else {
      this.jueces = this.juecesFiltro;
    }
    this.juecesTabla = [];
    for (let i = 0; i < this.rowPerPage; i++) {
      if (this.jueces[i]) {
        this.juecesTabla.push(this.jueces[i]);
      }
    }
    this.currentPage = 1;
  }
}

