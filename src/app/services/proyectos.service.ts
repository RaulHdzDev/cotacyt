import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServicesConfig } from '../config/services.config';
import { Observable } from 'rxjs';
import { Proyectos, ProyectSelect } from '../models/proyectos.model';
import { Session } from '../models/session.model';
import { InformacionDeLosProyectos } from '../models/proyectos.model';

@Injectable({
  providedIn: 'root'
})
export class ProyectosService {
  sessionData: Session;
  constructor( private http: HttpClient, private servicesConfig: ServicesConfig) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
  }

  obtenerTodosLosProyectos(idSedes: string): Observable<Proyectos[]> {
    return this.http.get<Proyectos[]>( this.servicesConfig.APP_ENDPOINT
      + 'api/proyectos/all?id_sedes='
      + idSedes);
  }
  obtenerTodosLosProyectosCategoria(idCategorias: string): Observable<Proyectos[]> {
    return this.http.get<Proyectos[]>( this.servicesConfig.APP_ENDPOINT
      + 'api/proyectos/all-categoria?id_sedes='
      + this.sessionData.id_sedes
      + '&id_categorias=' + idCategorias);
  }
  obtenerProyectosSuperUser(idCategorias: string): Observable<Proyectos[]> {
    return this.http.get<Proyectos[]>(this.servicesConfig.APP_ENDPOINT
      + 'api/proyectos/all-list-categoria?id_categorias=' + idCategorias);
  }
  obtenerProyectosSuperUserTemp(idCategorias: string, idSedes: string): Observable<Proyectos[]> {
    return this.http.get<Proyectos[]>( this.servicesConfig.APP_ENDPOINT
      + 'api/proyectos/all-categoria?id_sedes='
      + idSedes
      + '&id_categorias=' + idCategorias);
  }
  obtenerProyecto(idProyectos: string): Observable<Proyectos> {
    return this.http.get<Proyectos>(this.servicesConfig.APP_ENDPOINT + 'api/proyectos/' + idProyectos);
  }
  actualizarEstado( idProyectos: string ): Observable<any> {
    console.log(idProyectos);
    return this.http.put(this.servicesConfig.APP_ENDPOINT + 'api/proyectos/modificar-status', {id_proyectos: idProyectos});
  }
  setProyectoCalificado(proyecto: any): Observable<any> {
    const body = {
      id_proyectos: proyecto.id_proyectos,
      titulo_proyecto: proyecto.nombre,
      sede: proyecto.sede,
      categoria: proyecto.categorias,
      id_jueces: this.sessionData.id_jueces
    };
    return this.http.post(this.servicesConfig.APP_ENDPOINT + 'api/proyectos-calificados/nuevo', body);
  }
  postNuevoProyecto(body: any) {
    return this.http.post(this.servicesConfig.APP_ENDPOINT + 'api/proyectos/nuevo', body);
  }
  importProyectoExcel(body: any): Observable<any> {
    return this.http.post(this.servicesConfig.APP_ENDPOINT + 'api/upload-excel', body);
  }
  obtenerTodosLosProyectosDeCategoria(): Observable<Proyectos[]> {
    return this.http.get<Proyectos[]>(
      this.servicesConfig.APP_ENDPOINT
      + 'api/proyectos/all/categoria?id_categorias='
      + this.sessionData.id_categorias
      + '&id_sedes=' + this.sessionData.id_sedes
      + '&id_jueces=' + this.sessionData.id_jueces
    );
  }
  obtenerTodosLosProyectosEstatal() {
    return this.http.get(this.servicesConfig.APP_ENDPOINT +
      'api/proyectos-estatales/all/categoria?id_categorias='
      + this.sessionData.id_categorias
      + '&id_jueces=' + this.sessionData.id_jueces);
  }
  obtenerInformacionDeUnProyecto(idProyectos: string): Observable<InformacionDeLosProyectos[]> {
    const body = {
      id_proyectos: idProyectos,
      id_jueces: this.sessionData.id_jueces,
      id_categorias: this.sessionData.id_categorias
    };
    return this.http.post<InformacionDeLosProyectos[]>(this.servicesConfig.APP_ENDPOINT + 'api/proyectos/calificacion', body);
  }
  obtenerInformacionDeUnProyectoAdmin(id_proyectos: string): Observable<InformacionDeLosProyectos[]> {
    return this.http.get<InformacionDeLosProyectos[]>(this.servicesConfig.APP_ENDPOINT + 'api/proyectos/all/details/' + id_proyectos);
  }
  getStatusAdmin(idProyectos: string): Observable<any> {
    const body = {
      id_proyectos: idProyectos
    };
    return this.http.post<any>(this.servicesConfig.APP_ENDPOINT + 'api/proyectos/admin/obtener-status', body);
  }
  getStatusProyecto(idProyecto: string): Observable<any> {
    const body = {
      id_proyectos: idProyecto,
      id_jueces: this.sessionData.id_jueces
    };
    return this.http.post<any>(this.servicesConfig.APP_ENDPOINT + 'api/proyectos/obtener-status', body);
  }

  getProyectosPorCategoria(): Observable<any> {
    return this.http.get<any>(this.servicesConfig.APP_ENDPOINT + 'api/dashboard/proyectos-por-categoria');
  }

  getAsesoresPorSede(): Observable<any> {
    return this.http.get<any>(this.servicesConfig.APP_ENDPOINT + 'api/dashboard/asesores-por-sede');
  }

  getParticipantesPorSede(): Observable<any> {
    return this.http.get<any>(this.servicesConfig.APP_ENDPOINT + 'api/dashboard/participantes-por-sede');
  }

  getParticipantesPorCategoria(): Observable<any> {
    return this.http.get<any>(this.servicesConfig.APP_ENDPOINT + 'api/dashboard/participantes-por-categoria');
  }
  getAutoresProyecto(idProyecto: string): Observable<any> {
    return this.http.get(this.servicesConfig.APP_ENDPOINT
      + 'api/autores/per-project?id_sedes=' + this.sessionData.id_sedes
      + '&id_proyectos=' + idProyecto);
  }
  obtenerProyectosSelect(idJueces: string): Observable<ProyectSelect[]> {
    return this.http.get<ProyectSelect[]>(this.servicesConfig.APP_ENDPOINT
      + 'api/proyectos/all/per-judge?id_jueces=' + idJueces );
  }
  // apis para enlazar las dos aplicaciones
  getProjectsCatSede(sede: string, cat: string): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/proyectos/${sede}/${cat}`);
  }
  getProjectsCat(cat: string): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/proyectos/${this.sessionData.sede}/${cat}`);
  }
  getEstadisticasAsesoresPorSede(): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/estadisticas/asesores/sede`);
  }
  getEstadisticasProyectosPorCategoria(): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/estadisticas/proyectos/categoria`);
  }
  getEstadisticasParticipantesPorSede(): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/estadisticas/participantes/sede`);
  }
  getEstadisticasParticipantesPorCategoria(): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/estadisticas/participantes/categoria`);
  }
  getProject(id: string): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/proyecto/${id}`);
  }
}

