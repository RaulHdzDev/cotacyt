import { Component, OnInit, ViewChild } from '@angular/core';
import { Proyectos } from 'src/app/models/proyectos.model';
import { ProyectosService } from 'src/app/services/proyectos.service';
import { UtilService } from '../../services/util.service';
import { Session } from '../../models/session.model';
import { Sedes } from '../../models/sedes.model';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { JuecesService } from 'src/app/services/jueces.service';
import { forkJoin } from 'rxjs';
import { SedesService } from '../../services/sedes.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import swal from 'sweetalert2';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-sede',
  templateUrl: './sede.component.html',
  styleUrls: ['./sede.component.scss']
})
export class SedeComponent implements OnInit {

  @ViewChild('swalid3') private swalid1: SwalComponent;

  sessionData: Session;
  sedes: Sedes[];
  superUser: boolean;
  sedeActual = '1';
  categoriaActua = '1';
  public formsRegistroJuez: FormGroup;
  formFecha: FormGroup;
  tipoJuez = '';
  tipoJ = false;

  constructor(
    public formBuilder: FormBuilder,
    private juecesService: JuecesService,
    private sedesService: SedesService,
    private utilService: UtilService
  ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.formsRegistroJuez = formBuilder.group({
      id_categorias: [1, [Validators.required]],
      usuario:       ['', [Validators.required, Validators.maxLength(30)]],
      contrasena:    ['', [Validators.required, Validators.maxLength(20)]],
      nombre:        ['', [Validators.required, Validators.maxLength(100)]],
      id_sedes:      [this.sessionData.id_sedes],
      ids_proyectos: [''],
      rol: ['admin'],
    });
    this.utilService._loading = true;
    this.formFecha = formBuilder.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    });
   }

  ngOnInit(): void {
    this.tipoJ = false;
    this.superUser = this.sessionData.rol === 'superuser';
    if ( this.sessionData.rol === 'superuser') {
      forkJoin({
        sedes: this.sedesService.getSedes()
      }).subscribe(
        data => {
          this.sedes = data.sedes;
        }
        ).add(() => {
          this.utilService._loading = false;
        });
    } else {
      forkJoin({
        sedes: this.sedesService.getSedes()
      }).subscribe(
        data => {
          this.sedes = data.sedes;
        }
        ).add(() => {
          this.utilService._loading = false;
        });
    }
  }

  registrarJuez() {
    this.utilService.loading = true;
    this.juecesService.registrarJuez(this.formsRegistroJuez.value).subscribe(
      data => {
        swal.fire({
          icon: 'success',
          title: 'Exito',
          text: 'El coordinador se registro correctamente'
        });
        this.formsRegistroJuez.reset({
          id_sedes: this.sessionData.id_sedes,
          id_categorias: 1,
          rol: 'admin'
        });
      },
      err => {
        swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al registrar el coordinador'
        });
        console.log(err);
      }
    ).add(() => {
      this.utilService.loading = false;
    });
  }
  onChangeTipo(value) {
    this.utilService._loading = true;
    this.tipoJuez = value;
    if (this.tipoJuez == 'juez') {
      this.tipoJ = true;
    } else {
      this.tipoJ = false;
    }
    this.utilService._loading = false;
  }

  mostrarSwal(evt: any) {
    this.swalid1.fire();
  }
  subirFechas() {
    this.sedesService.fechasJ( this.sessionData.id_sedes, this.formFecha.value.fechaInicio, this.formFecha.value.fechaFin).subscribe(
      data => {
        this.swalid1.dismiss();
      }
     );
  }

}
