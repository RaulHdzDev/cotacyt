import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as internal from 'events';
import { SedesService } from 'src/app/services/sedes.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { Session } from '../../models/session.model';
import { PeriodoService } from '../../services/periodo.service';

@Component({
  selector: 'app-periodo',
  templateUrl: './periodo.component.html',
  styleUrls: ['./periodo.component.scss']
})
export class PeriodoComponent implements OnInit {

  sessionData: Session;
  formFechaJueces: FormGroup;
  formFechaProyectos: FormGroup;
  estatal: boolean;
  status: any = 0;
  constructor(
    public formBuilder: FormBuilder,
    private sedesService: SedesService,
    private periodoService: PeriodoService,
    private utilService: UtilService,
  ) { 
    this.formFechaJueces = formBuilder.group({
      fechaInicioJ: ['', Validators.required],
      fechaFinJ: ['', Validators.required]
    });
    this.formFechaProyectos = formBuilder.group({
      fechaInicioP: ['', Validators.required],
      fechaFinP: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    // this.estatal = JSON.parse(localStorage.getItem('estatal'));
    this.utilService.loading = true;
    this.periodoService.getStatus().subscribe(
      data => {
        this.status = data;
        if(this.status == 0) {
          this.estatal = false;
        }
        else if(this.status == 1){
          this.estatal = true;
        }
      }
    ).add(()=>{
      this.utilService.loading = false;
    });
    
  }

  iniciarEstatal(){
    Swal.fire({
      icon: 'warning',
      title: 'ETAPA ESTATAL',
      text: 'Esta a punto de iniciar la etapa estatal',
      showCancelButton: true,
      showConfirmButton: true,
    }).then(
      res => {
        if(res.isConfirmed){
          this.utilService.loading = true;
          this.periodoService.initEstatal().subscribe(
            data => {
              console.log(data.error);
            }
          ).add(() => {
            this.utilService.loading = false;
            window.location.reload();
          });
        } else if(res.dismiss){
            Swal.fire('Etapa estatal cancelada', '', 'info')
        }
      }, 
      err => {
        console.log(err);
      }
    );
      // this.estatal = JSON.parse(localStorage.getItem('estatal'));
      console.log(this.estatal + ' estatal');
  }

  subirFechasJ(){
    if(this.formFechaJueces.value.fechaInicioJ != '' && this.formFechaJueces.value.fechaFinJ != ''){
      this.periodoService.uploadFechas(this.formFechaJueces.value.fechaInicioJ, this.formFechaJueces.value.fechaFinJ).subscribe(
        data => {
          // this.swalid1.dismiss();
          console.log(data);
        }
       ).add(()=>{
        Swal.fire({
          icon: 'success',
          text: 'Fechas ingresadas'
        });
       });
    } else {
      Swal.fire({
        icon: 'warning',
        text: 'Asegurese de ingresar las fechas de inicio y fin'
      });
      console.log('ok');
    }
    
  }
  subirFechasP(){
    if(this.formFechaProyectos.value.fechaInicioP != '' && this.formFechaProyectos.value.fechaFinP != ''){
      this.periodoService.uploadFechasP(this.formFechaProyectos.value.fechaInicioP, this.formFechaProyectos.value.fechaFinP).subscribe(
        data => {
          // this.swalid1.dismiss();
          console.log(data);
        }
       ).add(()=>{
        Swal.fire({
          icon: 'success',
          text: 'Fechas ingresadas'
        });
       });
    } else {
      Swal.fire({
        icon: 'warning',
        text: 'Asegurese de ingresar las fechas de inicio y fin'
      });
      console.log('ok');
    }
  }
  executeDeleteSystem(){
    Swal.fire({
      icon: 'warning',
      title: 'Reinicio',
      text: 'Se eliminaran los proyectos, jueces, asesores y autores',
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(
      res => {
        if(res.isConfirmed){
          this.utilService.loading = true;
          this.periodoService.executeDeleteSystem().subscribe(
            data => {
              console.log(data);
            }
          ).add(() => {
            this.utilService.loading = false;
            window.location.reload();
          });
        } else if(res.isDismissed){
          Swal.fire('Reinicio del sistema cancelado', '', 'info')
        }
      },
      err => {
        console.log(err);
      }
    );
    
  }
}
