import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JuecesService } from '../../services/jueces.service';
import { ServicesConfig } from '../../config/services.config';
import { RouterLinkActive, Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import swal from 'sweetalert2';
import { PeriodoService } from '../../services/periodo.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  inicio: '';
  fin: '';
  status: boolean;
  statusInter: boolean;
  estatal = false;
  internacional = false;
  public formLoginJudge: FormGroup;
  constructor(
    public formBuilder: FormBuilder,
    private juecesService: JuecesService,
    private router: Router,
    private utilService: UtilService,
    private periodoService: PeriodoService,
  ) {

    this.formLoginJudge = formBuilder.group({
      usuario: ['', [Validators.required]],
      contrasena: ['', [Validators.required]],
    });
  }

  ngOnInit(): void { }

  iniciarSesion() {
    this.utilService.loading = true;

    this.juecesService.iniciarSesionJuez(this.formLoginJudge.value).subscribe(
      data => {
        if (data) {
          this.periodoService.getFechas().subscribe(
            dara => {
              if(dara == null){
                if (data.rol !== 'juez') {
                  this.router.navigateByUrl('home');
                  localStorage.setItem('session', JSON.stringify(data));
                }
              } else {
                let completeDateI = new Date(dara.fecha_inicio);
                let completeDateF = new Date(dara.fecha_fin);
                let currentDate = new Date();
                if (data.rol !== 'juez') {
                  this.router.navigateByUrl('home');
                  localStorage.setItem('session', JSON.stringify(data));
                } else if (data.rol === 'juez') {
                  this.periodoService.getStatus().subscribe(
                    data2 => {
                      this.status = data2;
                      if (!this.status) {
                        this.estatal = false;
                      } else if (this.status) {
                        this.estatal = true;
                      }
                      this.periodoService.getStatusInternacional().subscribe(
                        data3 => {
                          this.statusInter = data3;
                          if (!this.statusInter) {
                            this.internacional = false;
                          } else if (this.statusInter) {
                            this.internacional = true;
                          }
                          if (currentDate >= completeDateI && currentDate <= completeDateF) {
                            if (this.estatal && !this.internacional && data.id_sedes == 8) {
                              // entra login juez estatal
                              this.router.navigateByUrl('home');
                              localStorage.setItem('session', JSON.stringify(data));
                            } else if (this.internacional && this.estatal && data.id_sedes == 9) {
                              // entra login juez internacional
                              this.router.navigateByUrl('home');
                              localStorage.setItem('session', JSON.stringify(data));
                            } else if (!this.estatal && !this.internacional && data.id_sedes < 8) {
                              // entra login juez regional
                              this.juecesService.getValidarTermino(data.id_jueces).subscribe(res => {
                                if (res.termino !== '1') {
                                  this.router.navigateByUrl('home');
                                  localStorage.setItem('session', JSON.stringify(data));
                                } else {
                                  swal.fire('', 'Ya terminaste de evaluar tus proyectos', 'warning');
                                  console.log("hola");
                                  
                                }
                              }, err => console.log(err));
                            } else {
                              swal.fire({
                                icon: 'warning',
                                text: 'Actualmente no tienes acceso al sistema '
                              });
                            }
                            // this.router.navigateByUrl('home');
                            // localStorage.setItem('session', JSON.stringify(data));
                          } else if (currentDate < completeDateI) {
                            swal.fire({
                              icon: 'info',
                              text: 'Aun no inicia el periodo de evaluacion'
                            });
                          } else if (currentDate > completeDateF) {
                            swal.fire({
                              icon: 'info',
                              text: 'Ya termino el periodo de evaluacion'
                            });
                          }
                        }
                      );
                    }
                  );

                } else {
                  console.log('No valido');
                }
              }
              
            }// fin dara

          );


        } else {
          console.log(data);
          swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Contraseña incorrecta'
          });
        }
      },
      err => console.log(err)
    ).add(() => {
      this.utilService._loading = false;
    });
  }

}
