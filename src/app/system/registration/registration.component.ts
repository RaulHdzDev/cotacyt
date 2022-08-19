import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { JuecesService } from '../../services/jueces.service';
import { UtilService } from 'src/app/services/util.service';
import swal from 'sweetalert2';
import { SedesService } from '../../services/sedes.service';
import { Sedes } from '../../models/sedes.model';
import { Session } from '../../models/session.model';
import { Proyectos } from '../../models/proyectos.model';
import { ProyectosService } from 'src/app/services/proyectos.service';
import { JudgesRegisteredService } from '../../services/judges.service';
import { forkJoin } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import Swal from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';




@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  @ViewChild('swalid1') private swalid1: SwalComponent;
  @ViewChild('cv') private cvPdf: ElementRef;

  public isCollapsed = false;
  sedes: Sedes[];
  sessionData: Session;
  proyectos: any[];
  proyectosSeleccionados: any[];
  dropdownSettingsProyecto: IDropdownSettings;
  public formsRegistroJuez: FormGroup;
  formFecha: FormGroup;
  superUser: boolean;
  categoriaActua = 'petit';
  tipoJuez = '';
  tipoJLog = false;
  tipoJ = false;
  sedeActual = 'el mante';
  constructor(
    public formBuilder: FormBuilder,
    private juecesService: JuecesService,
    private sedesService: SedesService,
    private judgeRegistredService: JudgesRegisteredService,
    private proyectosService: ProyectosService,
    private utilService: UtilService
  ) {
    this.proyectos = new Array<Proyectos>();
    this.proyectosSeleccionados = new Array<Proyectos>();
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.formsRegistroJuez = formBuilder.group({
      id_categorias: [1, [Validators.required]],
      usuario: ['', [Validators.required, Validators.maxLength(30)]],
      contrasena: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      id_sedes: [this.sessionData.id_sedes],
      ids_proyectos: [''],
      rol: ['juez'],
      cv: ['']
    });
    this.utilService._loading = true;
    this.formFecha = formBuilder.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    this.tipoJ = true;
    this.superUser = this.sessionData.rol === 'superuser';
    //this.tipoJLog = this.sessionData.rol === 'admin';
    if (this.sessionData.rol === 'superuser') {
      forkJoin({
        proyectos: this.proyectosService.getProjectsCatSede(this.sedeActual, this.categoriaActua),
        sedes: this.sedesService.getSedes()
      }).subscribe(
        data => {
          this.proyectos = data.proyectos.proyectos;
          this.sedes = data.sedes;
        }
      ).add(() => {
        this.utilService._loading = false;
        // Settings para proyecto
        this.dropdownSettingsProyecto = {
          singleSelection: false,
          idField: 'id',
          textField: 'titulo',
          allowSearchFilter: true,
          noDataAvailablePlaceholderText: 'No hay proyectos',
          searchPlaceholderText: 'Buscar',
          selectAllText: 'Seleccionar todo',
          unSelectAllText: 'Deseleccionar todo'
        };
      });
    } else {
      forkJoin({
        proyectos: this.proyectosService.getProjectsCat('petit'),
        sedes: this.sedesService.getSedes()
      }).subscribe(
        data => {
          this.proyectos = data.proyectos.data;
          this.sedes = data.sedes;
        }
      ).add(() => {
        this.utilService._loading = false;
        // Settings para proyecto
        this.dropdownSettingsProyecto = {
          singleSelection: false,
          idField: 'id',
          textField: 'titulo',
          allowSearchFilter: true,
          noDataAvailablePlaceholderText: 'No hay proyectos',
          searchPlaceholderText: 'Buscar',
          selectAllText: 'Seleccionar todo',
          unSelectAllText: 'Deseleccionar todo'
        };
      });
    }
  }
  registrarJuez() {
    this.utilService.loading = true;
    const fd = new FormData();
    fd.append('cv', this.cvPdf.nativeElement.files[0]);
    fd.append('nombre', this.formsRegistroJuez.get('nombre').value);
    fd.append('usuario', this.formsRegistroJuez.get('usuario').value);
    this.juecesService.uploadCv(fd).subscribe(res => {
      if (!res.error) {
        this.formsRegistroJuez.get('cv').setValue(res.path);
        this.juecesService.registrarJuez(this.formsRegistroJuez.value).subscribe(
          data => {
            console.log(data);
            swal.fire({
              icon: 'success',
              title: 'Exito',
              text: 'El juez se registro correctamente'
            });
            this.formsRegistroJuez.reset({
              id_sedes: this.sessionData.id_sedes,
              rol: 'juez'
            });
          },
          err => {
            swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un error al registrar el juez'
            });
            console.log(err);
          }
        );
      }
    }).add(() => {
      this.utilService.loading = false;
    });
  }
  addProyecto(item: any) {
    this.proyectosSeleccionados.push(item);
  }
  dropProyecto(item: any) {
    this.proyectosSeleccionados.map((res, index) => {
      if (res.id_proyectos === item.id) {
        this.proyectosSeleccionados.splice(index, 1);
      }
    });
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
    this.proyectosService.getProjectsCatSede(this.sedeActual, this.categoriaActua)
      .subscribe(data => {
        this.proyectos = data.data;
      }).add(() => this.utilService._loading = false);
  }
  onChangecategoriaActual(value) {
    this.utilService._loading = true;
    switch (value) {
      case '1':
        this.categoriaActua = 'petit';
        break;
      case '2':
        this.categoriaActua = 'kids';
        break;
      case '3':
        this.categoriaActua = 'juvenil';
        break;
      case '4':
        this.categoriaActua = 'Media superior';
        break;
      case '5':
        this.categoriaActua = 'superior';
        break;
      case '6':
        this.categoriaActua = 'posgrado';
        break;
    }
    if (this.sessionData.rol === 'superuser') {
      this.proyectosService.getProjectsCatSede(this.sedeActual, this.categoriaActua)
        .subscribe(data => {
          this.proyectos = data.data;
        }).add(() => this.utilService._loading = false);
    } else {
      this.proyectosService.getProjectsCat(value)
        .subscribe(data => {
          this.proyectos = data.data;
        }).add(() => this.utilService._loading = false);
    }
  }
  mostrarSwal(evt: any) {
    this.swalid1.fire();
  }
}
