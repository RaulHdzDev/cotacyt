import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ServicesConfig } from '../config/services.config';

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {

  constructor(private http: HttpClient, private servicesConfig: ServicesConfig) { }

  initEstatal(): Observable<any> {
    return this.http.get(this.servicesConfig.APP_ENDPOINT + 'api/estatal/activar');
  }
  initInternacional(): Observable<any> {
    return this.http.get(this.servicesConfig.APP_ENDPOINT + 'api/internacional/activar');
  }
  getStatus():Observable<any> {
    return this.http.get(this.servicesConfig.APP_ENDPOINT + 'api/estatal/status');
  }
  getStatusInternacional():Observable<any> {
    return this.http.get(this.servicesConfig.APP_ENDPOINT + 'api/internacional/status');
  }
  uploadFechas(inicio: string, fin: string):Observable<any> {
    const body = {
      fecha_inicio: inicio,
      fecha_fin: fin
    }
    return this.http.post(this.servicesConfig.APP_ENDPOINT + 'api/sedes/fechas', body);
  }
  uploadFechasP(inicio: string, fin: string):Observable<any> {
    const body = {
      fecha_inicio: inicio,
      fecha_fin: fin
    }
    return this.http.post(this.servicesConfig.APP_ENDPOINT + 'api/proyectos/fechas', body);
  }
  getFechas():Observable<any> {
    return this.http.get(this.servicesConfig.APP_ENDPOINT + 'api/sedes/obtener-fechas');
  }
  executeDeleteSystem():Observable<any> {
    return this.http.get(this.servicesConfig.APP_ENDPOINT + 'api/sistema/reiniciar');
  }
}
