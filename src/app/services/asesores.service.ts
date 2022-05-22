import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServicesConfig } from '../config/services.config';
import { Observable } from 'rxjs';
import { Asesores } from '../models/asesores.model';
import { Session } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class AsesoresService {
  sessionData: Session;
  constructor( private http: HttpClient, private servicesConfig: ServicesConfig ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
  }
  getAsesores(): Observable<Asesores[]> {
    return this.http.get<Asesores[]>(this.servicesConfig.APP_ENDPOINT
      + 'api/asesores/all?id_sedes=' + this.sessionData.id_sedes);
  }
  getAsesoresSuperUser(): Observable<Asesores[]> {
    return this.http.get<Asesores[]>(this.servicesConfig.APP_ENDPOINT + 'api/asesores/all-admin');
  }
  deleteAsesor(idAsesor: string) {
    return this.http.delete(this.servicesConfig.APP_ENDPOINT + 'api/asesores/eliminar/' + idAsesor);
  }
  postAsesor(body: any): Observable<any> {
    return this.http.post( this.servicesConfig.APP_ENDPOINT + 'api/asesores/nuevo', body );
  }
  updateAsesor( body: any ): Observable<any> {
    return this.http.put( this.servicesConfig.APP_ENDPOINT + 'api/asesores/modificar', body);
  }
  uploadAdviserImgIne(body: any): Observable<any> {
    return this.http.post('https://mante.hosting.acm.org/api-cecit-2021/assessor/upload-image', body, {
      reportProgress: true,
      observe: 'events'
    });
  }

  getAllAsesores(): Observable<[]> {
    return this.http.get<[]>(`http://127.0.0.1:8000/api/asesores-all`);
  }
  getAllAsesoresSede(): Observable<[]> {
    return this.http.get<[]>(`http://127.0.0.1:8000/api/asesores-sede/${this.sessionData.sede}`);
  }
}
