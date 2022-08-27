import { Component, OnInit, ViewChild } from '@angular/core';
import { Session } from '../../../models/session.model';
import { forkJoin } from 'rxjs';
import { CoordinadorService } from '../../../services/coordinador.service';
import { UtilService } from '../../../services/util.service';
import { SedesService } from '../../../services/sedes.service';
import { JudgesRegistered } from '../../../models/judges.model';
import { Sedes } from '../../../models/sedes.model';
import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ProyectosService } from 'src/app/services/proyectos.service';
import { Proyectos } from 'src/app/models/proyectos.model';

@Component({
  selector: 'app-admin-registered',
  templateUrl: './admin-registered.component.html',
  styleUrls: ['./admin-registered.component.scss']
})
export class AdminRegisteredComponent implements OnInit {

  @ViewChild('swalid') private swalEdit: SwalComponent;
  sessionData: Session;
  superUser: boolean;
  admins: Array<JudgesRegistered> = [];
  adminActual: JudgesRegistered;
  sedes: Sedes[];
  formAdmin: FormGroup;
  proyectos: Proyectos[];
  adminsFiltro: JudgesRegistered[];
  categoriaActual = '1';
  sedeActual = '1';
  adminsTabla: JudgesRegistered[] = [];
  rowPerPage = 10;
  currentPage = 1;
  constructor(
    private adminsService: CoordinadorService,
    private utilService: UtilService,
    private sedesService: SedesService,
    private proyectosService: ProyectosService,
    private formBuilder: FormBuilder,
  ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.admins = new Array<JudgesRegistered>();
    this.utilService.loading = true;
    this.formAdmin = this.formBuilder.group({
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
    if (this.sessionData.rol === 'superuser') {
      forkJoin({
        jueces: this.adminsService.getAdminSueperUser(),
        sedes: this.sedesService.getSedes(),
      }).subscribe(
        data => {
          this.admins = data.jueces;
          this.sedes = data.sedes;
          this.adminsFiltro = this.admins;
        },
        err => {
          console.log(err);
        }
      ).add(() => {
        this.adminsTabla = [];
        for (let i = 0; i < this.rowPerPage; i++) {
          if (this.admins[i]) {
            this.adminsTabla.push(this.admins[i]);
          }
        }
        this.utilService.loading = false;
      });
    }
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

  vaciarInfo() {
    this.proyectos = [];
  }

  open(juez: JudgesRegistered) {
    this.adminActual = juez;
    this.superUser
      ? this.formAdmin.patchValue({
        id_jueces: this.adminActual.id_jueces,
        usuario: this.adminActual.usuario,
        contrasena: this.adminActual.contrasena,
        nombre: this.adminActual.nombre,
        id_sedes: this.sessionData.id_sedes,
        id_categorias: this.adminActual.id_categorias
      })
      : this.formAdmin.patchValue({
        id_jueces: this.adminActual.id_jueces,
        usuario: this.adminActual.usuario,
        contrasena: this.adminActual.contrasena,
        nombre: this.adminActual.nombre,
        id_sedes: this.adminActual.id_sedes,
        id_categorias: this.adminActual.id_categorias
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


  nextPage(): void {
    const total = Math.round(this.admins.length / this.rowPerPage) < (this.admins.length / this.rowPerPage)
      ? Math.round(this.admins.length / this.rowPerPage) + 1
      : Math.round(this.admins.length / this.rowPerPage);
    if (this.currentPage < total) {
      this.adminsTabla = [];
      for (let i = this.currentPage * this.rowPerPage; i < this.admins.length; i++) {
        if (i <= (this.currentPage * this.rowPerPage) + this.rowPerPage) {
          this.adminsTabla.push(this.admins[i]);
        }
      }
      this.currentPage++;
    }
  }
  previousPage(): void {
    if (this.currentPage > 1) {
      this.adminsTabla = [];
      this.currentPage--;
      for (let i = (this.currentPage * this.rowPerPage) - this.rowPerPage; i < this.admins.length; i++) {
        if (i <= ((this.currentPage * this.rowPerPage) + this.rowPerPage) - this.rowPerPage) {
          this.adminsTabla.push(this.admins[i]);
        }
      }
    }
  }

  onChangeSedeActualFiltro(value: string) {
    this.admins = this.adminsFiltro;
    if (value !== 'todo') {
      const adminsTemp: JudgesRegistered[] = [];
      this.admins.forEach((admin, _) => {
        if (admin.sede.toLowerCase() === value.toLowerCase()) {
          adminsTemp.push(admin);
        }
      });
      this.admins = adminsTemp;
    } else {
      this.admins = this.adminsFiltro;
    }
    this.adminsTabla = [];
    for (let i = 0; i < this.rowPerPage; i++) {
      if (this.admins[i]) {
        this.adminsTabla.push(this.admins[i]);
      }
    }
    this.currentPage = 1;
  }

}
