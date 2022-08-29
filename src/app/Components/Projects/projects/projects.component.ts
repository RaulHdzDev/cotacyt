import { Component, OnInit, ViewChild } from '@angular/core';
import { DashboardService } from '../../../services/dashboard.service';
import { ProyectosCalificados, ProyectosPorCalificar } from '../../../models/dashboard.model';
import { CategoriasService } from '../../../services/categorias.service';
import { ProyectosService } from '../../../services/proyectos.service';
import { Proyectos } from '../../../models/proyectos.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CalificarProyectoService } from '../../../services/calificar-proyecto.service';
import { UtilService } from '../../../services/util.service';
import { Util } from '../../../utils/utils';
import { ProjectRegistered } from '../../../models/project-regis.model';
import { ProjectsRegisteredService } from '../../../services/project-registered.service';
import { Session } from 'src/app/models/session.model';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { InformacionDeLosProyectos } from '../../../models/proyectos.model';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { JuecesService } from '../../../services/jueces.service';
import { jsPDF } from 'jspdf';
import '../../../../assets/cotacytResources/fonts/Helvetica.ttf';
import { TitleCasePipe } from '@angular/common';


@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  @ViewChild('swalid1') private swalInformacion: SwalComponent;
  @ViewChild('swalid2') private swalReproductor: SwalComponent;

  public isCollapsed = true;
  public allProjects: Array<ProjectRegistered>;

  informacionDeLosProyectos: InformacionDeLosProyectos[];


  categoria: string;
  video: string;
  proyectosCalificados: ProyectosCalificados[];
  proyectosPorCalificar: ProyectosPorCalificar[];
  proyectoActual: any;
  formPuntos: FormGroup;
  valores: any;
  obtenido1: number;
  obtenido2: number;
  obtenido3: number;
  obtenido4: number;
  obtenido5: number;
  obtenido6: number;
  obtenido7: number;
  obtenido8: number;
  sessionData: Session;
  validacionProjectos: number;

  constructor(
    private dashboardService: DashboardService,
    private categoriasService: CategoriasService,
    private proyectosService: ProyectosService,
    private formBuilder: FormBuilder,
    private calificarProyectoService: CalificarProyectoService,
    private utilService: UtilService,
    private projectsService: ProjectsRegisteredService,
    private infoProject: ProyectosService,
    private projectsJudges: JuecesService,
    private titlecasePipe: TitleCasePipe
  ) {
    this.proyectosCalificados = new Array<ProyectosCalificados>();
    this.proyectosPorCalificar = new Array<ProyectosPorCalificar>();
    this.obtenido1 = 0;
    this.obtenido2 = 0;
    this.obtenido3 = 0;
    this.obtenido4 = 0;
    this.obtenido5 = 0;
    this.obtenido6 = 0;
    this.obtenido7 = 0;
    this.obtenido8 = 0;
    this.allProjects = new Array<ProjectRegistered>();
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    // Trae la categoria actual
    this.categoriasService.getCategorias().subscribe(data => {
      this.categoria = data.categoria;
      this.categoria = this.categoria.toLowerCase();
      this.generarForm(this.categoria);
    });

    this.utilService.loading = true;
  }

  ngOnInit(): void {
    forkJoin({
      todosLosProyectos: this.proyectosService.obtenerTodosLosProyectosDeCategoria(),
      validarProjectos: this.projectsJudges.getValidacionProyectos(this.sessionData.id_jueces),
    }).subscribe(
      (data: any) => {
        this.proyectosCalificados = data.proyectosCalificados;
        this.proyectosPorCalificar = data.proyectosPorCalificar;
        this.allProjects = data.todosLosProyectos;
        this.validacionProjectos = data.validarProjectos.termino;
      },
      err => {
        console.log(err);
      }
    ).add(() => {
      this.utilService._loading = false;
    });
  }

  abrirReproductor(evento: any, id) {
    window.open(id, '_blank');
  }

  pdf(event) {
    window.open('http://plataforma.cotacyt.gob.mx/expociencias/creatividad/' + event, '_blank');
  }

  traerProyecto(idProyecto: string) {
    this.isCollapsed = true;
    this.utilService.loading = true;
    this.proyectosService.getProject(idProyecto).subscribe(
      data => {
        this.proyectoActual = data.data;
        console.log(data)
        this.proyectosService.getStatusProyecto(this.proyectoActual.id_proyectos)
          .subscribe((res) => {
            console.log(res)
            if (res[0].status === '1') {
              this.getCalificacionesProyecto(this.categoria, Number(this.proyectoActual.id_proyectos))
                .subscribe(calificaciones => {
                  this.categoria = this.categoria.toLowerCase();
                  switch (this.categoria) {
                    case 'petit':
                      this.formPuntos.patchValue({
                        obtenido1: Number(calificaciones[0].obtenido1),
                        obtenido2: Number(calificaciones[0].obtenido2),
                        obtenido3: Number(calificaciones[0].obtenido3),
                        obtenido4: Number(calificaciones[0].obtenido4),
                        obtenido5: Number(calificaciones[0].obtenido5),
                      });
                      this.obtenido1 = Number(calificaciones[0].obtenido1);
                      this.obtenido2 = Number(calificaciones[0].obtenido2);
                      this.obtenido3 = Number(calificaciones[0].obtenido3);
                      this.obtenido4 = Number(calificaciones[0].obtenido4);
                      this.obtenido5 = Number(calificaciones[0].obtenido5);
                      console.log(this.formPuntos.value);
                      break;
                    case 'kids':
                      this.formPuntos.patchValue({
                        obtenido1: Number(calificaciones[0].obtenido1),
                        obtenido2: Number(calificaciones[0].obtenido2),
                        obtenido3: Number(calificaciones[0].obtenido3),
                        obtenido4: Number(calificaciones[0].obtenido4),
                        obtenido5: Number(calificaciones[0].obtenido5),
                      });
                      this.obtenido1 = Number(calificaciones[0].obtenido1);
                      this.obtenido2 = Number(calificaciones[0].obtenido2);
                      this.obtenido3 = Number(calificaciones[0].obtenido3);
                      this.obtenido4 = Number(calificaciones[0].obtenido4);
                      this.obtenido5 = Number(calificaciones[0].obtenido5);
                      break;
                    case 'juvenil':
                      this.formPuntos.patchValue({
                        obtenido1: Number(calificaciones[0].obtenido1),
                        obtenido2: Number(calificaciones[0].obtenido2),
                        obtenido3: Number(calificaciones[0].obtenido3),
                        obtenido4: Number(calificaciones[0].obtenido4),
                        obtenido5: Number(calificaciones[0].obtenido5),
                        obtenido6: Number(calificaciones[0].obtenido6),
                      });
                      this.obtenido1 = Number(calificaciones[0].obtenido1);
                      this.obtenido2 = Number(calificaciones[0].obtenido2);
                      this.obtenido3 = Number(calificaciones[0].obtenido3);
                      this.obtenido4 = Number(calificaciones[0].obtenido4);
                      this.obtenido5 = Number(calificaciones[0].obtenido5);
                      this.obtenido6 = Number(calificaciones[0].obtenido6);
                      break;
                    case 'media superior':
                      this.formPuntos.patchValue({
                        obtenido1: Number(calificaciones[0].obtenido1),
                        obtenido2: Number(calificaciones[0].obtenido2),
                        obtenido3: Number(calificaciones[0].obtenido3),
                        obtenido4: Number(calificaciones[0].obtenido4),
                        obtenido5: Number(calificaciones[0].obtenido5),
                        obtenido6: Number(calificaciones[0].obtenido6),
                        obtenido7: Number(calificaciones[0].obtenido7),
                        obtenido8: Number(calificaciones[0].obtenido8),
                      });
                      this.obtenido1 = Number(calificaciones[0].obtenido1);
                      this.obtenido2 = Number(calificaciones[0].obtenido2);
                      this.obtenido3 = Number(calificaciones[0].obtenido3);
                      this.obtenido4 = Number(calificaciones[0].obtenido4);
                      this.obtenido5 = Number(calificaciones[0].obtenido5);
                      this.obtenido6 = Number(calificaciones[0].obtenido6);
                      this.obtenido7 = Number(calificaciones[0].obtenido7);
                      this.obtenido8 = Number(calificaciones[0].obtenido8);
                      break;
                    case 'superior':
                      this.formPuntos.patchValue({
                        obtenido1: Number(calificaciones[0].obtenido1),
                        obtenido2: Number(calificaciones[0].obtenido2),
                        obtenido3: Number(calificaciones[0].obtenido3),
                        obtenido4: Number(calificaciones[0].obtenido4),
                        obtenido5: Number(calificaciones[0].obtenido5),
                        obtenido6: Number(calificaciones[0].obtenido6),
                        obtenido7: Number(calificaciones[0].obtenido7),
                        obtenido8: Number(calificaciones[0].obtenido8),
                      });
                      this.obtenido1 = Number(calificaciones[0].obtenido1);
                      this.obtenido2 = Number(calificaciones[0].obtenido2);
                      this.obtenido3 = Number(calificaciones[0].obtenido3);
                      this.obtenido4 = Number(calificaciones[0].obtenido4);
                      this.obtenido5 = Number(calificaciones[0].obtenido5);
                      this.obtenido6 = Number(calificaciones[0].obtenido6);
                      this.obtenido7 = Number(calificaciones[0].obtenido7);
                      this.obtenido8 = Number(calificaciones[0].obtenido8);
                      break;
                    case 'posgrado':
                      this.formPuntos.patchValue({
                        obtenido1: Number(calificaciones[0].obtenido1),
                        obtenido2: Number(calificaciones[0].obtenido2),
                        obtenido3: Number(calificaciones[0].obtenido3),
                        obtenido4: Number(calificaciones[0].obtenido4),
                        obtenido5: Number(calificaciones[0].obtenido5),
                        obtenido6: Number(calificaciones[0].obtenido6),
                        obtenido7: Number(calificaciones[0].obtenido7),
                        obtenido8: Number(calificaciones[0].obtenido8),
                      });
                      this.obtenido1 = Number(calificaciones[0].obtenido1);
                      this.obtenido2 = Number(calificaciones[0].obtenido2);
                      this.obtenido3 = Number(calificaciones[0].obtenido3);
                      this.obtenido4 = Number(calificaciones[0].obtenido4);
                      this.obtenido5 = Number(calificaciones[0].obtenido5);
                      this.obtenido6 = Number(calificaciones[0].obtenido6);
                      this.obtenido7 = Number(calificaciones[0].obtenido7);
                      this.obtenido8 = Number(calificaciones[0].obtenido8);
                      break;
                  }
                }, err => console.log(err));
            } else {
              this.obtenido1 = 0;
              this.obtenido2 = 0;
              this.obtenido3 = 0;
              this.obtenido4 = 0;
              this.obtenido5 = 0;
              this.obtenido6 = 0;
              this.obtenido7 = 0;
              this.obtenido8 = 0;
            }
          });
      },
      err => console.log(err)
    ).add(() => {
      this.utilService.loading = false;
    });
  }
  getCalificacionesProyecto(categoria: string, idProyecto: number) {
    // if (this.sessionData.id_sedes === '8') {
    //   return this.calificarProyectoService.getCalificacionesEstatales(categoria, idProyecto);
    // } else
    if (this.sessionData.id_sedes === '9') {
      return this.calificarProyectoService.getCalificacionesInternacionales(categoria, idProyecto);
    } else {
      return this.calificarProyectoService.getCalificaciones(categoria, idProyecto);
    }
  }
  guardarPuntos() {
    this.valores = this.formPuntos.value;
    this.utilService.loading = true;
    console.log(this.categoria);
    this.proyectosService.getStatusProyecto(this.proyectoActual.id_proyectos)
      .subscribe((res) => {
        this.categoria = this.categoria.toLowerCase();
        switch (this.categoria) {
          case 'petit':
            if (res[0].status === '1') {
              this.calificarProyectoService.putCalificacionesPetit(
                Number(this.proyectoActual.id_proyectos),
                this.valores.obtenido1,
                this.valores.obtenido2,
                this.valores.obtenido3,
                this.valores.obtenido4,
                this.valores.obtenido5,
              ).subscribe(
                _ => {
                  Swal.fire({
                    title: 'El proyecto se califico',
                    icon: 'success'
                  });
                },
                err => {
                  console.log(err);
                  Swal.fire({
                    title: 'Ocurrio un error',
                    icon: 'error'
                  });
                });
              this.utilService.loading = false;
              this.ngOnInit();
              this.proyectoActual = null;
            } else {
              this.calificarProyectoService.setCalificacionesPetit(
                Number(this.proyectoActual.id_proyectos),
                this.valores.obtenido1,
                this.valores.obtenido2,
                this.valores.obtenido3,
                this.valores.obtenido4,
                this.valores.obtenido5,
              ).subscribe(
                _ => {
                  Swal.fire({
                    title: 'El proyecto se califico',
                    icon: 'success'
                  });
                },
                err => {
                  console.log(err);
                  Swal.fire({
                    title: 'Ocurrio un error',
                    icon: 'error'
                  });
                });
              this.proyectosService.setProyectoCalificado(this.proyectoActual)
                .subscribe(data => {
                  console.log(data);
                }, err => {
                  console.log(err);
                  Swal.fire({
                    title: 'Ocurrio un error',
                    icon: 'error'
                  });
                });
              this.utilService.loading = false;
              this.ngOnInit();
              this.proyectoActual = null;
            }
            break;
          case 'kids':
            if (res[0].status === '1') {
              this.calificarProyectoService.putCalificacionesKids(
                Number(this.proyectoActual.id_proyectos),
                this.valores.obtenido1,
                this.valores.obtenido2,
                this.valores.obtenido3,
                this.valores.obtenido4,
                this.valores.obtenido5,
              ).subscribe(
                _ => {
                  Swal.fire({
                    title: 'El proyecto se califico',
                    icon: 'success'
                  });
                },
                err => {
                  console.log(err);
                  Swal.fire({
                    title: 'Ocurrio un error',
                    icon: 'error'
                  });
                });
              this.utilService.loading = false;
              this.ngOnInit();
            } else {
              this.calificarProyectoService.setCalificacionesKids(
                Number(this.proyectoActual.id_proyectos),
                this.valores.obtenido1,
                this.valores.obtenido2,
                this.valores.obtenido3,
                this.valores.obtenido4,
                this.valores.obtenido5,
              ).subscribe(
                _ => {
                  Swal.fire({
                    title: 'El proyecto se califico',
                    icon: 'success'
                  });
                },
                err => {
                  console.log(err);
                  Swal.fire({
                    title: 'Ocurrio un error',
                    icon: 'error'
                  });
                });
              this.proyectosService.setProyectoCalificado(this.proyectoActual)
                .subscribe(data => {
                  console.log(data);
                }, err => {
                  console.log(err);
                  Swal.fire({
                    title: 'Ocurrio un error',
                    icon: 'error'
                  });
                });
              this.utilService.loading = false;
              this.ngOnInit();
            }
            break;
          case 'juvenil':
            if (res[0].status === '1') {
              this.calificarProyectoService.putCalificacionesJvenil(
                Number(this.proyectoActual.id_proyectos),
                this.valores.obtenido1,
                this.valores.obtenido2,
                this.valores.obtenido3,
                this.valores.obtenido4,
                this.valores.obtenido5,
                this.valores.obtenido6)
                .subscribe(
                  _ => {
                    Swal.fire({
                      title: 'El proyecto se califico',
                      icon: 'success'
                    });
                  },
                  err => {
                    console.log(err);
                    Swal.fire({
                      title: 'Ocurrio un error',
                      icon: 'error'
                    });
                  });
              this.utilService.loading = false;
              this.ngOnInit();
            } else {
              this.calificarProyectoService.setCalificacionesJvenil(
                Number(this.proyectoActual.id_proyectos),
                this.valores.obtenido1,
                this.valores.obtenido2,
                this.valores.obtenido3,
                this.valores.obtenido4,
                this.valores.obtenido5,
                this.valores.obtenido6).subscribe(
                  data => {
                    Swal.fire({
                      title: 'El proyecto se califico',
                      icon: 'success'
                    });
                  },
                  err => {
                    console.log(err);
                    Swal.fire({
                      title: 'Ocurrio un error',
                      icon: 'error'
                    });
                  });
              this.proyectosService.setProyectoCalificado(this.proyectoActual)
                .subscribe(data => {
                  console.log(data);
                }, err => {
                  console.log(err);
                  Swal.fire({
                    title: 'Ocurrio un error',
                    icon: 'error'
                  });
                });
              this.utilService.loading = false;
              this.ngOnInit();
            }
            break;
          case 'media superior':
            if (res[0].status === '1') {
              this.calificarProyectoService.putCalificacionesMediaSuperior(
                Number(this.proyectoActual.id_proyectos),
                this.valores.obtenido1,
                this.valores.obtenido2,
                this.valores.obtenido3,
                this.valores.obtenido4,
                this.valores.obtenido5,
                this.valores.obtenido6,
                this.valores.obtenido7,
                this.valores.obtenido8,
              ).subscribe(
                _ => {
                  Swal.fire({
                    title: 'El proyecto se califico',
                    icon: 'success'
                  });
                },
                err => {
                  console.log(err);
                  Swal.fire({
                    title: 'Ocurrio un error',
                    icon: 'error'
                  });
                });
              this.utilService.loading = false;
              this.ngOnInit();
            } else {
              this.calificarProyectoService.setCalificacionesMediaSuperior(
                Number(this.proyectoActual.id_proyectos),
                this.valores.obtenido1,
                this.valores.obtenido2,
                this.valores.obtenido3,
                this.valores.obtenido4,
                this.valores.obtenido5,
                this.valores.obtenido6,
                this.valores.obtenido7,
                this.valores.obtenido8,
              ).subscribe(
                _ => {
                  Swal.fire({
                    title: 'El proyecto se califico',
                    icon: 'success'
                  });
                },
                err => {
                  console.log(err);
                  Swal.fire({
                    title: 'Ocurrio un error',
                    icon: 'error'
                  });
                });
              this.proyectosService.setProyectoCalificado(this.proyectoActual)
                .subscribe(data => {
                  console.log(data);
                }, err => {
                  console.log(err);
                  Swal.fire({
                    title: 'Ocurrio un error',
                    icon: 'error'
                  });
                });
              this.utilService.loading = false;
              this.ngOnInit();
            }
            break;
          case 'superior':
            if (res[0].status === '1') {
              this.calificarProyectoService.putCalificacionesSuperior(
                Number(this.proyectoActual.id_proyectos),
                this.valores.obtenido1,
                this.valores.obtenido2,
                this.valores.obtenido3,
                this.valores.obtenido4,
                this.valores.obtenido5,
                this.valores.obtenido6,
                this.valores.obtenido7,
                this.valores.obtenido8).subscribe(
                  _ => {
                    Swal.fire({
                      title: 'El proyecto se califico',
                      icon: 'success'
                    });
                  },
                  err => {
                    console.log(err);
                    Swal.fire({
                      title: 'Ocurrio un error',
                      icon: 'error'
                    });
                  });
              this.utilService.loading = false;
              this.ngOnInit();
            } else {
              this.calificarProyectoService.setCalificacionesSuperior(
                Number(this.proyectoActual.id_proyectos),
                this.valores.obtenido1,
                this.valores.obtenido2,
                this.valores.obtenido3,
                this.valores.obtenido4,
                this.valores.obtenido5,
                this.valores.obtenido6,
                this.valores.obtenido7,
                this.valores.obtenido8).subscribe(
                  _ => {
                    Swal.fire({
                      title: 'El proyecto se califico',
                      icon: 'success'
                    });
                  },
                  err => {
                    console.log(err);
                    Swal.fire({
                      title: 'Ocurrio un error',
                      icon: 'error'
                    });
                  });
              this.proyectosService.setProyectoCalificado(this.proyectoActual)
                .subscribe(data => {
                  console.log(data);
                }, err => {
                  console.log(err);
                  Swal.fire({
                    title: 'Ocurrio un error',
                    icon: 'error'
                  });
                });
              this.utilService.loading = false;
              this.ngOnInit();
            }
            break;
          case 'posgrado':
            if (res[0].status === '1') {
              this.calificarProyectoService.putCalificacionesPosgrado(
                Number(this.proyectoActual.id_proyectos),
                this.valores.obtenido1,
                this.valores.obtenido2,
                this.valores.obtenido3,
                this.valores.obtenido4,
                this.valores.obtenido5,
                this.valores.obtenido6,
                this.valores.obtenido7,
                this.valores.obtenido8).subscribe(
                  _ => {
                    Swal.fire({
                      title: 'El proyecto se califico',
                      icon: 'success'
                    });
                  },
                  err => {
                    console.log(err);
                    Swal.fire({
                      title: 'Ocurrio un error',
                      icon: 'error'
                    });
                  });
              this.utilService.loading = false;
              this.ngOnInit();
            } else {
              this.calificarProyectoService.setCalificacionesPosgrado(
                Number(this.proyectoActual.id_proyectos),
                this.valores.obtenido1,
                this.valores.obtenido2,
                this.valores.obtenido3,
                this.valores.obtenido4,
                this.valores.obtenido5,
                this.valores.obtenido6,
                this.valores.obtenido7,
                this.valores.obtenido8).subscribe(
                  _ => {
                    Swal.fire({
                      title: 'El proyecto se califico',
                      icon: 'success'
                    });
                  },
                  err => {
                    console.log(err);
                    Swal.fire({
                      title: 'Ocurrio un error',
                      icon: 'error'
                    });
                  });
              this.proyectosService.setProyectoCalificado(this.proyectoActual)
                .subscribe(data => {
                  console.log(data);
                }, err => {
                  console.log(err);
                  Swal.fire({
                    title: 'Ocurrio un error',
                    icon: 'error'
                  });
                });
              this.utilService.loading = false;
              this.ngOnInit();
            }
            break;
        }
        this.generarForm(this.categoria);
        this.isCollapsed = !this.isCollapsed;
        this.proyectoActual = null;
        this.ngOnInit();
      });
  }
  generarForm(categoria: string) {
    const expReg = RegExp('^([0-9]{1,2}(\.[0-9]{1,2})?)$');
    categoria = categoria.toLowerCase();
    switch (categoria) {
      case 'petit':
        this.formPuntos = this.formBuilder.group({
          obtenido1: [0, [Validators.required, Validators.max(10), Validators.min(0), Validators.pattern(expReg)]],
          obtenido2: [0, [Validators.required, Validators.max(40), Validators.min(0), Validators.pattern(expReg)]],
          obtenido3: [0, [Validators.required, Validators.max(10), Validators.min(0), Validators.pattern(expReg)]],
          obtenido4: [0, [Validators.required, Validators.max(20), Validators.min(0), Validators.pattern(expReg)]],
          obtenido5: [0, [Validators.required, Validators.max(20), Validators.min(0), Validators.pattern(expReg)]],
        });
        break;
      case 'kids':
        this.formPuntos = this.formBuilder.group({
          obtenido1: [0, [Validators.required, Validators.max(10), Validators.min(0), Validators.pattern(expReg)]],
          obtenido2: [0, [Validators.required, Validators.max(40), Validators.min(0), Validators.pattern(expReg)]],
          obtenido3: [0, [Validators.required, Validators.max(10), Validators.min(0), Validators.pattern(expReg)]],
          obtenido4: [0, [Validators.required, Validators.max(20), Validators.min(0), Validators.pattern(expReg)]],
          obtenido5: [0, [Validators.required, Validators.max(20), Validators.min(0), Validators.pattern(expReg)]],
        });
        break;
      case 'juvenil':
        this.formPuntos = this.formBuilder.group({
          obtenido1: [0, [Validators.required, Validators.max(10), Validators.min(0), Validators.pattern(expReg)]],
          obtenido2: [0, [Validators.required, Validators.max(30), Validators.min(0), Validators.pattern(expReg)]],
          obtenido3: [0, [Validators.required, Validators.max(5), Validators.min(0), Validators.pattern(expReg)]],
          obtenido4: [0, [Validators.required, Validators.max(15), Validators.min(0), Validators.pattern(expReg)]],
          obtenido5: [0, [Validators.required, Validators.max(20), Validators.min(0), Validators.pattern(expReg)]],
          obtenido6: [0, [Validators.required, Validators.max(20), Validators.min(0), Validators.pattern(expReg)]],
        });
        break;
      case 'media superior':
        this.formPuntos = this.formBuilder.group({
          obtenido1: [0, [Validators.required, Validators.max(10), Validators.min(0), Validators.pattern(expReg)]],
          obtenido2: [0, [Validators.required, Validators.max(30), Validators.min(0), Validators.pattern(expReg)]],
          obtenido3: [0, [Validators.required, Validators.max(5), Validators.min(0), Validators.pattern(expReg)]],
          obtenido4: [0, [Validators.required, Validators.max(15), Validators.min(0), Validators.pattern(expReg)]],
          obtenido5: [0, [Validators.required, Validators.max(15), Validators.min(0), Validators.pattern(expReg)]],
          obtenido6: [0, [Validators.required, Validators.max(15), Validators.min(0), Validators.pattern(expReg)]],
          obtenido7: [0, [Validators.required, Validators.max(5), Validators.min(0), Validators.pattern(expReg)]],
          obtenido8: [0, [Validators.required, Validators.max(5), Validators.min(0), Validators.pattern(expReg)]],
        });
        break;
      case 'superior':
        this.formPuntos = this.formBuilder.group({
          obtenido1: [0, [Validators.required, Validators.max(10), Validators.min(0), Validators.pattern(expReg)]],
          obtenido2: [0, [Validators.required, Validators.max(30), Validators.min(0), Validators.pattern(expReg)]],
          obtenido3: [0, [Validators.required, Validators.max(5), Validators.min(0), Validators.pattern(expReg)]],
          obtenido4: [0, [Validators.required, Validators.max(15), Validators.min(0), Validators.pattern(expReg)]],
          obtenido5: [0, [Validators.required, Validators.max(15), Validators.min(0), Validators.pattern(expReg)]],
          obtenido6: [0, [Validators.required, Validators.max(15), Validators.min(0), Validators.pattern(expReg)]],
          obtenido7: [0, [Validators.required, Validators.max(5), Validators.min(0), Validators.pattern(expReg)]],
          obtenido8: [0, [Validators.required, Validators.max(5), Validators.min(0), Validators.pattern(expReg)]],
        });
        break;
      case 'posgrado':
        this.formPuntos = this.formBuilder.group({
          obtenido1: [0, [Validators.required, Validators.max(25), Validators.min(0), Validators.pattern(expReg)]],
          obtenido2: [0, [Validators.required, Validators.max(30), Validators.min(0), Validators.pattern(expReg)]],
          obtenido3: [0, [Validators.required, Validators.max(5), Validators.min(0), Validators.pattern(expReg)]],
          obtenido4: [0, [Validators.required, Validators.max(10), Validators.min(0), Validators.pattern(expReg)]],
          obtenido5: [0, [Validators.required, Validators.max(10), Validators.min(0), Validators.pattern(expReg)]],
          obtenido6: [0, [Validators.required, Validators.max(10), Validators.min(0), Validators.pattern(expReg)]],
          obtenido7: [0, [Validators.required, Validators.max(5), Validators.min(0), Validators.pattern(expReg)]],
          obtenido8: [0, [Validators.required, Validators.max(5), Validators.min(0), Validators.pattern(expReg)]],
        });
        break;
    }
  }




  // mostrarInfoTodosLosProyectos(proyecto: ProjectRegistered) {
  //   this.utilService._loading = true;
  //   if (this.sessionData.rol === 'admin') {
  //     this.infoProject.obtenerInformacionDeUnProyectoAdmin(proyecto.id_proyectos).subscribe(
  //       data => {
  //         this.informacionDeLosProyectos = data;
  //       },
  //       err => console.log(err)
  //     ).add(() => {
  //       this.utilService._loading = false;
  //     });
  //   } else {
  //     this.infoProject.obtenerInformacionDeUnProyecto(proyecto.id_proyectos).subscribe(
  //       data => {
  //         this.informacionDeLosProyectos = data;
  //       },
  //       err => console.log(err)
  //     ).add(() => {
  //       this.utilService._loading = false;
  //     });
  //   }
  //   this.swalInformacion.fire();
  // }

  updateValidationProjects() {
    this.projectsJudges.updateEvaluation(this.sessionData.id_jueces).subscribe(
      data => {
        localStorage.removeItem('session');
        Swal.fire({
          title: data,
          text: 'Se cerrara la sesion',
          icon: 'success'
        });
      },
      err => {
        console.log(err);
      }
    );
  }

}
