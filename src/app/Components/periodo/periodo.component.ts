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
  estatal: boolean = false;
  internacional: boolean = false;
  status: boolean;
  statusInter: boolean;
  valPass: any;
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
        if (!this.status) {
          this.estatal = false;
        }
        else if (this.status) {
          this.estatal = true;
        }
      }
    ).add(() => {
      this.utilService.loading = false;
    });
    this.periodoService.getStatusInternacional().subscribe(
      data => {
        this.statusInter = data;
        if (!this.statusInter)
          this.internacional = false;
        else if (this.statusInter)
          this.internacional = true;
      }
    );
  }

  iniciarEstatal() {
    Swal.fire({
      icon: 'warning',
      title: 'ETAPA ESTATAL',
      text: 'Esta a punto de iniciar la etapa estatal',
      showCancelButton: true,
      showConfirmButton: true,
    }).then(
      res => {
        if (res.isConfirmed) {
          Swal.fire({
            title: 'Ingrese la contraseña',
            input: 'password',
            showCancelButton: true,
            showConfirmButton: true,
            inputValidator: psw => {
              if (!psw) {
                return "Por favor escribe la contraseña";
              } else {
                return undefined;
              }
            }
          }).then(
            resultado => {
              if (resultado.value) {
                let pass = resultado.value;
                this.valPass = JSON.parse(localStorage.getItem('session'))
                if (this.valPass.contrasena === resultado.value) {
                  this.utilService.loading = true;
                  this.periodoService.initEstatal().subscribe(
                    data => {
                      this.periodoService.saveEstatal(data).subscribe(
                        dara => {
                          console.log(dara);
                        }
                      ).add(() => {
                        this.utilService.loading = false;
                        window.location.reload();
                      });
                    }
                  );
                } else {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Contraseña incorrecta'
                  });
                }
              }
            }
          );
        } else if (res.dismiss) {
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

  iniciarInternacional() {
    Swal.fire({
      icon: 'warning',
      title: 'ETAPA INTERNACIONAL',
      text: 'Esta a punto de iniciar la etapa internacional',
      showCancelButton: true,
      showConfirmButton: true,
    }).then(
      res => {
        if (res.isConfirmed) {
          Swal.fire({
            title: 'Ingrese la contraseña',
            input: 'password',
            showCancelButton: true,
            showConfirmButton: true,
            inputValidator: psw => {
              if (!psw) {
                return 'Por favor escribe la contraseña';
              } else {
                return undefined;
              }
            }
          }).then(
            resultado => {
              if (resultado.value) {
                let pass = resultado.value;
                this.valPass = JSON.parse(localStorage.getItem('session'))
                if (this.valPass.contrasena === resultado.value) {
                  this.utilService.loading = true;
                  this.periodoService.saveInternacional().subscribe(
                    dara => {
                      console.log(dara);
                      if (!dara.error) {
                        this.periodoService.initInternacional().subscribe(da => {
                          console.log(da);
                        }, err => console.log(err));
                      }
                    }
                  ).add(() => {
                    this.utilService.loading = false;
                    window.location.reload();
                  });
                } else {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Contraseña incorrecta'
                  });
                }
              }
            }
          );
        } else if (res.dismiss) {
          Swal.fire('Etapa internacional cancelada', '', 'info');
        }
      },
      err => {
        console.log(err);
      }
    );
    console.log(this.internacional + ' internacional');
  }

  subirFechasJ() {
    if (this.formFechaJueces.value.fechaInicioJ != '' && this.formFechaJueces.value.fechaFinJ != '') {
      console.log(this.formFechaJueces.value.fechaInicioJ);
      console.log(this.formFechaJueces.value.fechaFinJ);
      this.periodoService.uploadFechas(this.formFechaJueces.value.fechaInicioJ, this.formFechaJueces.value.fechaFinJ).subscribe(
        data => {
          // this.swalid1.dismiss();
          console.log(data);
        }
      ).add(() => {
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
  subirFechasP() {
    if (this.formFechaProyectos.value.fechaInicioP != '' && this.formFechaProyectos.value.fechaFinP != '') {
      this.periodoService.uploadFechasP(this.formFechaProyectos.value.fechaInicioP, this.formFechaProyectos.value.fechaFinP).subscribe(
        data => {
          // this.swalid1.dismiss();
          console.log(data);
        }
      ).add(() => {
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
  executeDeleteSystem() {
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
        if (res.isConfirmed) {
          Swal.fire({
            title: 'Ingrese la contraseña',
            input: 'password',
            showCancelButton: true,
            showConfirmButton: true,
            inputValidator: psw => {
              if (!psw) {
                return "Por favor escribe la contraseña";
              } else {
                return undefined;
              }
            }
          }).then(resultado => {
            if (resultado.value) {
              let pass = resultado.value;
              this.valPass = JSON.parse(localStorage.getItem('session'))
              console.log(this.valPass.contrasena);
              if (this.valPass.contrasena === resultado.value) {
                this.utilService.loading = true;
                this.periodoService.executeDeleteSystem().subscribe(
                  data => {
                    console.log(data);
                  }
                ).add(() => {
                  this.utilService.loading = false;
                  window.location.reload();
                });
              } else {
                Swal.fire({
                  icon: 'warning',
                  title: 'Contraseña incorrecta'
                });
              }
            }
          });
        } else if (res.isDismissed) {
          Swal.fire('Reinicio del sistema cancelado', '', 'info')
        }
      },
      err => {
        console.log(err);
      }
    );

  }
}
