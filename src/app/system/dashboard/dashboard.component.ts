import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Totales, ProyectosCalificados, ProyectosPorCalificar, Totales2 } from '../../models/dashboard.model';
import { Session } from 'src/app/models/session.model';
import { CategoriasService } from '../../services/categorias.service';
import { CalificacionesService } from '../../services/calificaciones.service';
import { Calificaciones } from '../../models/calificaciones.model';
import { UtilService } from 'src/app/services/util.service';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, Color } from 'ng2-charts';
import swal from 'sweetalert2';
import { Util } from 'src/app/utils/utils';
import { ProjectsRegisteredService } from 'src/app/services/project-registered.service';
import { ProjectRegistered } from 'src/app/models/project-regis.model';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SwalComponent, SwalPortalTargets } from '@sweetalert2/ngx-sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CalificacionesPorCategoria } from '../../models/calificaciones.model';
import { InformacionDeLosProyectos } from '../../models/proyectos.model';
import { ProyectosService } from '../../services/proyectos.service';
import { jsPDF } from "jspdf";
import '../../../assets/cotacytResources/fonts/Helvetica.ttf';
import '../../../assets/cotacytResources/fonts/Caviar.ttf';
import { SedesService } from '../../services/sedes.service';
import { Sedes } from 'src/app/models/sedes.model';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {



  @ViewChild('swalid') private swalCalificaciones: SwalComponent;
  // @ViewChild('swalid1') private swalInformacion: SwalComponent;
  // @ViewChild('swalid2') private swalReproductor: SwalComponent;
  @ViewChild('video') private videoTag: any;



  public video: string;
  public formsFiltro: FormGroup;
  proyectosCalificacion: any[];
  proyectos: ProjectRegistered[];
  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        }
      ]
    }
  };
  public barChartColors: Color[] = [
    { backgroundColor: '#97c83c' },
  ];
  public barChartLabels: Label[] = ['Petit', 'Kids', 'Juvenil', 'Media Superior', 'Superior', 'Posgrado'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartData: ChartDataSets[];
  public ht;
  public hr;
  public hm;
  public hs;
  public util: Util;

  active: boolean =  true;

  totales: Totales[];
  totales2: Totales2;
  categoria: string;
  proyectosCalificados: any[];
  proyectosPorCalificar: any[];
  estadisticasDeProyectos: Calificaciones[];
  final: any[];

  proyectosCalificadosPorCategoria: CalificacionesPorCategoria[];
  informacionDeLosProyectos: InformacionDeLosProyectos[];

  sessionData: Session;
  fechaI: Date;
  fechaF: Date;
  fechaH: Date;
  asesorActual: any;
  sedeActual: string;
  categoriaActual: string;
  sedes: Sedes[];
  superUser: boolean;
  admingral: boolean;
  enlace: boolean;
  juez: boolean;
  constructor(
    private dashboardService: DashboardService,
    private categoriasService: CategoriasService,
    private calificacionesService: CalificacionesService,
    private utilsService: UtilService,
    private projectsService: ProjectsRegisteredService,
    public readonly swalTargets: SwalPortalTargets,
    public formBuilder: FormBuilder,
    private infoProject: ProyectosService,
    private sedeService: SedesService,
    private proyectosService: ProyectosService,
  ) {
    this.proyectosCalificacion = new Array<any>();
    this.totales = new Array<Totales>();
    this.sedes = new Array<Sedes>();
    this.proyectosCalificados = new Array<ProyectosCalificados>();
    this.proyectosPorCalificar = new Array<ProyectosPorCalificar>();
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.estadisticasDeProyectos = new Array<Calificaciones>();
    this.utilsService._loading = true;
    this.util = new Util;
    this.proyectos = new Array<ProjectRegistered>();
    this.proyectosCalificadosPorCategoria = new Array<CalificacionesPorCategoria>();
    this.sessionData.rol === 'superuser' ? this.superUser = true : this.superUser = false;
    this.sessionData.rol === 'juez' ? this.juez = true : this.juez = false;
  }

  ngOnInit(): void {
    setInterval(() => {
      const d = new Date();
      if (d.getHours() < 10) {
        this.hr = '0' + d.getHours() + ' :';
      } else {
        this.hr = d.getHours() + ' :';
      }
      if (d.getMinutes() < 10) {
        this.hm = '0' + d.getMinutes() + ' :';
      } else {
        this.hm = d.getMinutes() + ' :';
      }
      if (d.getSeconds() < 10) {
        this.hs = '0' + d.getSeconds();
      } else {
        this.hs = d.getSeconds();
      }

    }, 1000);
    this.barChartData = [
      { data: [], label: 'Proyectos' }
    ];
    if (this.sessionData.rol === 'superuser') {
      forkJoin({
        proyectos: this.dashboardService.getAllProjects(),
        totales: this.dashboardService.getTotalesSuperUser(),
        totales2: this.dashboardService.getTotalesProyectosParticipantes(),
        estadisticas: this.calificacionesService.proyectosEstadisticas(),
        grafica: this.dashboardService.getEstadisticasProyectosPorCategoria(),
        sedes: this.sedeService.getSedes(),
      }).subscribe(
        data => {
          console.log(data);
          this.totales = data.totales;
          this.totales2 = data.totales2.data;
          this.adminProjects(data.proyectos.proyectos);
          this.estadisticasDeProyectos = data.estadisticas;
          this.sedes = data.sedes,
            this.construirGrafica(data.grafica.estadisticas);
        }
      ).add(() => this.utilsService._loading = false);
      this.dashboardService.getTotalesSuperUser().subscribe(
        data => {
          this.totales = data;
        },
        err => console.log(err)
      );

      this.admingral = false;
      this.enlace = true;
    } else if (this.sessionData.rol === 'admin') {
      forkJoin({
        totales: this.dashboardService.getTotalesAdmin(),
        totales2: this.dashboardService.getTotalesProyectosParticipantesPorSede(),
        proyectos: this.projectsService.getAllProjectsSede(),
        estadisticas: this.calificacionesService.proyectosEstadisticasAdmin(),
        grafica: this.dashboardService.getEstadisticasProyectosPorCategoriaPorSede(),
        finalizado: this.dashboardService.getJudgesFinish(),
      }).subscribe(
        data => {
          console.log(data);
          this.totales = data.totales;
          this.totales2 = data.totales2.data;
          this.adminProjects(data.proyectos.proyectos);
          this.estadisticasDeProyectos = data.estadisticas;
          this.construirGrafica(data.grafica.estadisticas);
          this.final = data.finalizado;
          
          console.log(this.final);
          
        },
        err => {
          console.log(err);
        }
      ).add(() => this.utilsService._loading = false);
      this.admingral = true;
      this.enlace = false;
    } else {
      forkJoin({
        // proyectosCalificados: this.dashboardService.getProyectosCalificados(),
        totales: this.dashboardService.getTotales(),
        totales2: this.dashboardService.getTotalesProyectosParticipantesPorSede(),
        // proyectosPorCalificar: this.dashboardService.getProyectosPorCalificar(),
        // estadisticas: this.calificacionesService.proyectosEstadisticasJuez(),
        grafica: this.dashboardService.getEstadisticasProyectosPorCategoriaPorSede()
      }).subscribe(
        data => {
          this.totales2 = data.totales2.data;
          // this.proyectosCalificados = data.proyectosCalificados;
          // this.proyectosPorCalificar = data.proyectosPorCalificar;
          // this.estadisticasDeProyectos = data.estadisticas.estadisticas;
          this.construirGrafica(data.grafica.estadisticas);
          this.totales = data.totales;
        },
        err => {
          console.log(err);
        }
      ).add(() => this.utilsService._loading = false);
    }

    this.sessionData = JSON.parse(localStorage.getItem('session'));
    // obtiene la categoria de la sesión actual
    this.categoriasService.getCategorias().subscribe(data => {
      this.categoria = data.categoria;
    });

  }
  construirGrafica(data: any) {
    const petit = data.petit;
    const kids = data.kids;
    const juvenil = data.juvenil;
    const mediaSuperior = data['media-superior'];
    const superior = data.superior;
    const posgrado = data.posgrado;
    this.barChartData = [
      { data: [petit, kids, juvenil, mediaSuperior, superior, posgrado], label: 'Proyectos' }
    ];
  }

  adminProjects(proyectos) {
    proyectos.filter((res) => {
      this.proyectosService.getStatusAdmin(res.id_proyectos)
        .subscribe(data => {
          if (data[0].status === '1') {
            this.proyectosCalificados.push(res);
          } else {
            this.proyectosPorCalificar.push(res);
          }
        });
    });
  }

  getPercent(porcentaje: string) {
    Number(porcentaje);
    return {
      width: porcentaje + '%'
    };
  }

  mostrarProyectosPorCalificacion(evt: any) {
    this.swalCalificaciones.fire().then(
      res => {
        if (res.dismiss === Swal.DismissReason.backdrop) {
          this.reiniciarVariable();
        }
      }, err => {
        console.log(err);
      });
  }

  descargarLista() {
    console.log(this.categoriaActual);
    console.log(this.sedeActual);

   this.calificacionesService.listaDeCalificacionesAdmin(this.categoriaActual, this.sedeActual)
      .subscribe(data => this.descargarListaCalificaiones(data, this.categoriaActual))
      .add(() => this.utilsService.loading = false);

  }
  onChangeSede(value) {

    this.sedeActual = value;
    this.utilsService._loading = true;
     this.calificacionesService.listaDeCalificacionesAdmin(this.categoriaActual, this.sedeActual)
      .subscribe(data => this.mostrarListaCalificaiones(data, this.categoriaActual))
      .add(() => this.utilsService.loading = false);
  }
  onChangeCategoria(value) {
    this.categoriaActual = value;
    this.superUser
      ? this.calificacionesService.listaDeCalificacionesAdmin(value, this.sedeActual)
        .subscribe(data => this.mostrarListaCalificaiones(data, value))
        .add(() => this.utilsService.loading = false)
      : this.calificacionesService.listaDeCalificaciones(value)
        .subscribe((data: any) => this.mostrarListaCalificaiones(data, value),
          err => console.log(err))
        .add(() => this.utilsService.loading = false);
  }

  mostrarListaCalificaiones(data: any, value) {
    this.proyectosCalificadosPorCategoria = data;
    const petit = data.petit;
    const kids = data.kids;
    const juvenil = data.juvenil;
    const mediaSuperior = data['media_superior'];
    const superior = data.superior;
    const posgrado = data.posgrado;

    switch (value) {
      case '1':
        this.proyectosCalificacion = petit;
        // this.imprimir(this.proyectosCalificacion, 'petit');
        console.log(this.proyectosCalificacion.sort(function (prev: any, next: any) {
          return next.total - prev.total;
        }));
        this.ocultarTexto(this.proyectosCalificacion);
        break;
      case '2':
        this.proyectosCalificacion = kids;
        // this.imprimir(this.proyectosCalificacion, 'kids');
        this.ocultarTexto(this.proyectosCalificacion);
        break;

      case '3':
        this.proyectosCalificacion = juvenil;
        // this.imprimir(this.proyectosCalificacion, 'juvenil');
        this.ocultarTexto(this.proyectosCalificacion);
        break;

      case '4':
        this.proyectosCalificacion = mediaSuperior;
        // this.imprimir(this.proyectosCalificacion, 'media-superior');
        this.ocultarTexto(this.proyectosCalificacion);

        break;
      case '5':
        this.proyectosCalificacion = superior;
        // this.imprimir(this.proyectosCalificacion, 'superior');
        this.ocultarTexto(this.proyectosCalificacion);
        break;

      case '6':
        this.proyectosCalificacion = posgrado;
        // this.imprimir(this.proyectosCalificacion, 'posgrado');
        this.ocultarTexto(this.proyectosCalificacion);
        break;

      default:
        this.proyectosCalificacion = petit;
        this.ocultarTexto(this.proyectosCalificacion);
        break;

    }
  }

  ocultarTexto(proyectosCalificacion){
    if(this.proyectosCalificacion.length > 0){
      this.active = false;
    } else {
      this.active = true;
    }

  }

  descargarListaCalificaiones(data: any, value) {
    this.proyectosCalificadosPorCategoria = data;
    const petit = data.petit;
    const kids = data.kids;
    const juvenil = data.juvenil;
    const mediaSuperior = data['media_superior'];
    const superior = data.superior;
    const posgrado = data.posgrado;
    switch (value) {
      case '1':
        this.proyectosCalificacion = petit;
        this.imprimir(this.proyectosCalificacion, 'petit');
        console.log(this.proyectosCalificacion.sort(function (prev: any, next: any) {
          return next.total - prev.total;
        }));
        break;
      case '2':
        this.proyectosCalificacion = kids;
        this.imprimir(this.proyectosCalificacion, 'kids');
        break;
      case '3':
        this.proyectosCalificacion = juvenil;
        this.imprimir(this.proyectosCalificacion, 'juvenil');
        break;
      case '4':
        this.proyectosCalificacion = mediaSuperior;
        this.imprimir(this.proyectosCalificacion, 'media-superior');
        break;
      case '5':
        this.proyectosCalificacion = superior;
        this.imprimir(this.proyectosCalificacion, 'superior');
        break;
      case '6':
        this.proyectosCalificacion = posgrado;
        this.imprimir(this.proyectosCalificacion, 'posgrado');
        break;
      default:
        this.proyectosCalificacion = petit;
        break;
    }
  }


  abrirReproductor(evento: any, id) {
    window.open(id, '_blank');
  }

  pdf(event) {
    window.open('http://plataforma.cotacyt.gob.mx/expociencias/creatividad/' + event, '_blank');
  }

  imprimir(proyecto: any, categoria: any) {
    if (proyecto.length !== 0) {
      switch (categoria) {
        case 'petit':
          let contador6 = 0;
          const doc1 = new jsPDF({ orientation: 'landscape' });
          for (let i = 0; i < proyecto.length; i++) {
            let nombrePetit = '';
            let totalPetit = '';
            let sedePetit2 = '';
            for (let j = contador6; j < contador6 + 11; j++) {
              if (j >= proyecto.length) {
                continue;

              }
              let nombre: string;
              if (proyecto[j].nombre.length >= 60) {

                nombre = proyecto[j].nombre.substring(0, 60);
                nombre += '\r\n';
                nombre += proyecto[j].nombre.substring(60);
                totalPetit = totalPetit.concat(Math.round(parseInt(proyecto[j].total)).toFixed(2).toString(), '\r\n', '\r\n');
              } else {
                nombre = proyecto[j].nombre;
                totalPetit = totalPetit.concat(Math.round(parseInt(proyecto[j].total)).toFixed(2).toString(), '\r\n');
              }
              nombrePetit = nombrePetit.concat(nombre, '\r\n');
              sedePetit2 = proyecto[j].sede;


            }
            contador6 += 11;
            i = contador6;
            doc1.addImage('assets/cotacytResources/loginImages/logotamColor.png', 'png', 14, 13, 48, 24);
            doc1.addImage('assets/cotacytResources/loginImages/cecit.png', 'png', 243, 8, 39, 39).setFont('Caviar').setFontSize(20).setTextColor('#646464');
            doc1.text('Consejo Tamaulipeco de Ciencia y Tecnología', 150, 34, { align: "center" }).setFont('Caviar').setFontSize(18).setTextColor('#646464');
            doc1.text('Lista de Proyectos Categoría Petit Sede ' + sedePetit2 + '', 151, 46, { align: "center" }).setFont('Caviar').setFontSize(14).setTextColor('#646464');
            doc1.text('Proyecto', 35, 75);
            doc1.text(nombrePetit, 35, 90);
            doc1.text('Calificación', 220, 75);
            doc1.text(totalPetit, 220, 90);

            doc1.setFontSize(14);
            doc1.setFont('Caviar');
            doc1.addPage();
          }
          doc1.save("lista petit.pdf");
          break;

        case 'kids':
          let contador5 = 0;
          const doc8 = new jsPDF({ orientation: 'landscape' });
          for (let i = 0; i < proyecto.length; i++) {
            let nombreKids = '';
            let totalKids = '';
            let sedeKids = '';
            for (let j = contador5; j < contador5 + 11; j++) {
              if (j >= proyecto.length) {
                continue;

              }
              let nombre: string;
              if (proyecto[j].nombre.length >= 60) {

                nombre = proyecto[j].nombre.substring(0, 60);
                nombre += '\r\n';
                nombre += proyecto[j].nombre.substring(60);
                totalKids = totalKids.concat(Math.round(parseInt(proyecto[j].total)).toFixed(2).toString(), '\r\n', '\r\n');
              } else {
                nombre = proyecto[j].nombre;
                totalKids = totalKids.concat(Math.round(parseInt(proyecto[j].total)).toFixed(2).toString(), '\r\n');
              }
              nombreKids = nombreKids.concat(nombre, '\r\n');
              sedeKids = proyecto[j].sede;


            }
            contador5 += 11;
            i = contador5;
            doc8.addImage('assets/cotacytResources/loginImages/logotamColor.png', 'png', 12, 13, 38, 17);
            doc8.addImage('assets/cotacytResources/loginImages/cecit.png', 'png', 243, 8, 39, 39).setFont('Caviar').setFontSize(20).setTextColor('#646464');
            doc8.text('Consejo Tamaulipeco de Ciencia y Tecnología', 150, 34, { align: "center" }).setFont('Caviar').setFontSize(18).setTextColor('#646464');
            doc8.text('Lista de Proyectos Categoría Kids Sede ' + sedeKids + '', 151, 46, { align: "center" }).setFont('Caviar').setFontSize(14).setTextColor('#646464');
            doc8.text('Proyecto', 35, 75);
            doc8.text(nombreKids, 35, 90);
            doc8.text('Calificación', 220, 75);
            doc8.text(totalKids, 220, 90);

            doc8.setFontSize(14);
            doc8.setFont('Caviar');
            doc8.addPage();
          }
          doc8.save("lista kids.pdf");

          break;

        case 'juvenil':
          let contador4 = 0;
          const doc7 = new jsPDF({ orientation: 'landscape' });
          for (let i = 0; i < proyecto.length; i++) {
            let nombreJuvenil = '';
            let totalJuvenil = '';
            let sedeJuvenil = '';
            for (let j = contador4; j < contador4 + 11; j++) {
              if (j >= proyecto.length) {
                continue;

              }
              let nombre: string;
              if (proyecto[j].nombre.length >= 60) {

                nombre = proyecto[j].nombre.substring(0, 60);
                nombre += '\r\n';
                nombre += proyecto[j].nombre.substring(60);
                totalJuvenil = totalJuvenil.concat(Math.round(parseInt(proyecto[j].total)).toFixed(2).toString(), '\r\n', '\r\n');
              } else {
                nombre = proyecto[j].nombre;
                totalJuvenil = totalJuvenil.concat(Math.round(parseInt(proyecto[j].total)).toFixed(2).toString(), '\r\n');
              }
              nombreJuvenil = nombreJuvenil.concat(nombre, '\r\n');
              sedeJuvenil = proyecto[j].sede;

            }
            contador4 += 11;
            i = contador4;
            doc7.addImage('assets/cotacytResources/loginImages/logotamColor.png', 'png', 14, 13, 48, 24);
            doc7.addImage('assets/cotacytResources/loginImages/cecit.png', 'png', 243, 8, 39, 39).setFont('Caviar').setFontSize(20).setTextColor('#646464');
            doc7.text('Consejo Tamaulipeco de Ciencia y Tecnología', 150, 34, { align: "center" }).setFont('Caviar').setFontSize(18).setTextColor('#646464');
            doc7.text('Lista de Proyectos Categoría Juvenil Sede ' + sedeJuvenil + '', 151, 46, { align: "center" }).setFont('Caviar').setFontSize(14).setTextColor('#646464');
            doc7.text('Proyecto', 35, 75);
            doc7.text(nombreJuvenil, 35, 90);
            doc7.text('Calificación', 220, 75);
            doc7.text(totalJuvenil, 220, 90);

            doc7.setFontSize(14);
            doc7.setFont('Caviar');
            doc7.addPage();
          }
          doc7.save("lista juvenil.pdf");
          break;

        case 'media-superior':
          let contador3 = 0;
          const doc2 = new jsPDF({ orientation: 'landscape' });
          for (let i = 0; i < proyecto.length; i++) {
            let nombreMS = '';
            let totalMS = '';
            let sedeMS = '';
            for (let j = contador3; j < contador3 + 11; j++) {
              if (j >= proyecto.length) {
                continue;

              }
              let nombre: string;
              if (proyecto[j].nombre.length >= 60) {

                nombre = proyecto[j].nombre.substring(0, 60);
                nombre += '\r\n';
                nombre += proyecto[j].nombre.substring(60);
                totalMS = totalMS.concat(Math.round(parseInt(proyecto[j].total)).toFixed(2).toString(), '\r\n', '\r\n');
              } else {
                nombre = proyecto[j].nombre;
                totalMS = totalMS.concat(Math.round(parseInt(proyecto[j].total)).toFixed(2).toString(), '\r\n');
              }
              nombreMS = nombreMS.concat(nombre, '\r\n');
              sedeMS = proyecto[j].sede;


            }
            contador3 += 11;
            i = contador3;
            doc2.addImage('assets/cotacytResources/loginImages/logotamColor.png', 'png', 14, 13, 48, 24);
            doc2.addImage('assets/cotacytResources/loginImages/cecit.png', 'png', 243, 8, 39, 39).setFont('Caviar').setFontSize(20).setTextColor('#646464');
            doc2.text('Consejo Tamaulipeco de Ciencia y Tecnología', 150, 34, { align: "center" }).setFont('Caviar').setFontSize(18).setTextColor('#646464');
            doc2.text('Lista de Proyectos Categoría Media-Superior Sede ' + sedeMS + '', 151, 46, { align: "center" }).setFont('Caviar').setFontSize(14).setTextColor('#646464');
            doc2.text('Proyecto', 35, 75);
            doc2.text(nombreMS, 35, 90);
            doc2.text('Calificación', 220, 75);
            doc2.text(totalMS, 220, 90)
            doc2.setFontSize(14);
            doc2.setFont('Caviar');
            doc2.addPage();
          }
          doc2.save("lista media-superior.pdf");
          break;

        case 'superior':
          let contador = 0;
          const doc3 = new jsPDF({ orientation: 'landscape' });
          for (let i = 0; i < proyecto.length; i++) {

            let nombreSuperior = '';
            let totalSuperior = '';
            let sedeSuperior = '';

            for (let j = contador; j < contador + 11; j++) {
              if (j >= proyecto.length) {
                continue;

              }

              let nombre: string;
              if (proyecto[j].nombre.length >= 60) {

                nombre = proyecto[j].nombre.substring(0, 60);
                nombre += '\r\n';
                nombre += proyecto[j].nombre.substring(60);
                totalSuperior = totalSuperior.concat(Math.round(parseInt(proyecto[j].total)).toFixed(2).toString(), '\r\n', '\r\n');
              } else {
                nombre = proyecto[j].nombre;
                totalSuperior = totalSuperior.concat(Math.round(parseInt(proyecto[j].total)).toFixed(2).toString(), '\r\n');
              }
              nombreSuperior = nombreSuperior.concat(nombre, '\r\n');
              sedeSuperior = proyecto[j].sede;

            }
            contador += 11;
            i = contador;
            doc3.addImage('assets/cotacytResources/loginImages/logotamColor.png', 'png', 14, 13, 48, 24);
            doc3.addImage('assets/cotacytResources/loginImages/cecit.png', 'png', 243, 8, 39, 39).setFont('Caviar').setFontSize(20).setTextColor('#646464');
            doc3.text('Consejo Tamaulipeco de Ciencia y Tecnología', 150, 34, { align: "center" }).setFont('Caviar').setFontSize(18).setTextColor('#646464');
            doc3.text('Lista de Proyectos Categoría Superior Sede ' + sedeSuperior + '', 151, 46, { align: "center" }).setFont('Caviar').setFontSize(14).setTextColor('#646464');
            doc3.text('Proyecto', 35, 75);
            doc3.text(nombreSuperior, 35, 90);
            doc3.text('Calificación', 220, 75);
            doc3.text(totalSuperior, 220, 90);
            doc3.setFontSize(14);
            doc3.setFont('Caviar');
            doc3.addPage();
          }
          doc3.save("lista superior.pdf");
          break;

        case 'posgrado':
          let contador2 = 0;
          const doc4 = new jsPDF({ orientation: 'landscape' });
          for (let i = 0; i < proyecto.length; i++) {
            let nombrePosgrado = '';
            let totalPosgrado = '';
            let sedePosgrado = '';
            for (let j = contador2; j < contador2 + 11; j++) {
              if (j >= proyecto.length) {
                continue;
              }
              let nombre: string;
              if (proyecto[j].nombre.length >= 60) {

                nombre = proyecto[j].nombre.substring(0, 60);
                nombre += '\r\n';
                nombre += proyecto[j].nombre.substring(60);
                totalPosgrado = totalPosgrado.concat(Math.round(parseInt(proyecto[j].total)).toFixed(2).toString(), '\r\n', '\r\n');
              } else {
                nombre = proyecto[j].nombre;
                totalPosgrado = totalPosgrado.concat(Math.round(parseInt(proyecto[j].total)).toFixed(2).toString(), '\r\n');
              }
              nombrePosgrado = nombrePosgrado.concat(nombre, '\r\n');
              sedePosgrado = proyecto[j].sede;

            }
            contador2 += 11;
            i = contador2;
            doc4.addImage('assets/cotacytResources/loginImages/logotamColor.png', 'png', 14, 13, 48, 24);
            doc4.addImage('assets/cotacytResources/loginImages/cecit.png', 'png', 243, 8, 39, 39).setFont('Caviar').setFontSize(20).setTextColor('#646464');
            doc4.text('Consejo Tamaulipeco de Ciencia y Tecnología', 150, 34, { align: "center" }).setFont('Caviar').setFontSize(18).setTextColor('#646464');
            doc4.text('Lista de Proyectos Categoría Posgrado Sede ' + sedePosgrado + '', 151, 46, { align: "center" }).setFont('Caviar').setFontSize(14).setTextColor('#646464');
            doc4.text('Proyecto', 35, 75);
            doc4.text(nombrePosgrado, 35, 90);
            doc4.text('Calificación', 220, 75);
            doc4.text(totalPosgrado, 220, 90);

            doc4.setFontSize(14);
            doc4.setFont('Caviar');
            doc4.addPage();
          }

          doc4.save("lista posgrado.pdf");

          break;
        default:
          swal.fire({
            icon: 'error',
            title: 'No se encontró la categoría'

          });
          break;

      }
    }
  }
  reiniciarVariable(evt: any = null) {
    this.categoriaActual = '';
    this.sedeActual = '';
    this.proyectosCalificacion = new Array<any>();
  }
}

