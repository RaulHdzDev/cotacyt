import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Totales, ProyectosCalificados, ProyectosPorCalificar } from '../models/dashboard.model';
import { ServicesConfig } from '../config/services.config';
import { Session } from '../models/session.model';
import { Proyectos } from '../models/proyectos.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  sessionData: Session;
  constructor( private http: HttpClient, private servicesConfig: ServicesConfig ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
  }

  getTotales(): Observable<Totales[]> {
    return this.http.get<Totales[]>(this.servicesConfig.APP_ENDPOINT
    + 'api/dashboard/totales?id_categorias='
    + this.sessionData.id_categorias
    + '&id_sedes='
    + this.sessionData.id_sedes);
  }
  getTotalesAdmin(): Observable<Totales[]> {
    return this.http.get<Totales[]>(this.servicesConfig.APP_ENDPOINT
      + 'api/dashboard/totales-coordinador?id_sedes=' + this.sessionData.id_sedes);
  }
  getTotalesSuperUser(): Observable<Totales[]> {
    return this.http.get<Totales[]>(this.servicesConfig.APP_ENDPOINT + 'api/dashboard/totales-chino');
  }

  getProyectosCalificados(): Observable<ProyectosCalificados[]> {
    const body = {
      id_categorias: this.sessionData.id_categorias,
      id_jueces: this.sessionData.id_jueces,
      id_sedes: this.sessionData.id_sedes
    };
    return this.http.post<ProyectosCalificados[]>(
      this.servicesConfig.APP_ENDPOINT + 'api/dashboard/proyectos-calificados', body);
  }

  getProyectosPorCalificar(): Observable<ProyectosPorCalificar[]> {
    const body = {
      id_jueces: this.sessionData.id_jueces,
    };
    return this.http.post<ProyectosPorCalificar[]>(
      this.servicesConfig.APP_ENDPOINT + 'api/dashboard/proyectos-por-calificar', body);
  }
  getProyectosPorCategorias(): Observable<any> {
    return this.http.get<any>(this.servicesConfig.APP_ENDPOINT + 'api/dashboard/proyectos-por-categoria');
  }
  getProyectosPorCategoriasAdmin(): Observable<any> {
    return this.http.get<any>(this.servicesConfig.APP_ENDPOINT
      + 'api/dashboard/proyectos-por-categoria-sede?id_sedes=' + this.sessionData.id_sedes);
  }
  getProyectosSuperUser(): Observable<Proyectos[]> {
    return this.http.get<Proyectos[]>(this.servicesConfig.APP_ENDPOINT + 'api/proyectos/all/details');
  }

  getJudgesFinish(): Observable<any> {
    return this.http.get<any>(this.servicesConfig.APP_ENDPOINT + 'api/jueces-termino?sede='+ this.sessionData.sede);
  }

  // apis que conectan con el otro sistema

  getEstadisticasProyectosPorCategoria(): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/estadisticas/proyectos/categoria`);
  }
  getEstadisticasProyectosPorCategoriaPorSede(): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/estadisticas/proyectos/categoria/${this.sessionData.sede}`);
  }
  getTotalesProyectosParticipantes(): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/dashboard/header`);
  }
  getTotalesProyectosParticipantesPorSede(): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/dashboard/header/${this.sessionData.sede}`);
  }
  getAllProjects(): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/proyectos`);
  }
  getProject(id: string): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/proyecto/${id}`);
  }


}

