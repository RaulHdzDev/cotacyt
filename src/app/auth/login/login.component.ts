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
  fin: ''
  public formLoginJudge: FormGroup;
  constructor(public formBuilder: FormBuilder,
              private juecesService: JuecesService,
              private router: Router,
              private utilService: UtilService,
              private periodoService: PeriodoService) {

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
              this.inicio = dara.fecha_inicio;
              this.fin = dara.fecha_fin;
              let completeDateI = new Date(dara.fecha_inicio);
              let completeDateF = new Date(dara.fecha_fin + ', 23:59:59');
              let currentDate = new Date();
              console.log(currentDate);
              console.log(completeDateI);
              console.log(completeDateF);
              if(data.rol != 'juez'){
              } else if(data.rol == 'juez'){
                this.router.navigateByUrl('home');
                localStorage.setItem('session', JSON.stringify(data));
                if(currentDate >= completeDateI && currentDate <= completeDateF){
                  this.router.navigateByUrl('home');
                  localStorage.setItem('session', JSON.stringify(data));
                  console.log('El juez Es valido');
                } else if(currentDate < completeDateI){
                  swal.fire({
                    icon: 'info',
                    text: 'Aun no inicia el periodo de evaluacion'
                  });
                } else if(currentDate > completeDateF){
                  swal.fire({
                    icon: 'info',
                    text: 'Ya termino el periodo de evaluacion'
                  });
                }
              } else {
                console.log('No valida');
              }
            }
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
