import { Injectable } from '@angular/core';
import { Session } from '../models/session.model';
import { ServicesConfig } from '../config/services.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JudgesRegistered } from '../models/judges.model';

@Injectable({
  providedIn: 'root'
})
export class CoordinadorService {
  sessionData: Session;

  constructor( private http: HttpClient, private servicesConfig: ServicesConfig ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
   }
   
   getAdminSueperUser(): Observable<JudgesRegistered[]> {
    return this.http.get<JudgesRegistered[]>(this.servicesConfig.APP_ENDPOINT
      + 'api/admin/all');
  }

  getJudgesDetails(): Observable<JudgesRegistered[]> {
    return this.http.get<JudgesRegistered[]>(this.servicesConfig.APP_ENDPOINT
      + 'api/jueces/all/details?id_sedes=' + this.sessionData.id_sedes);
  }
  deleteJudges( idJuedge: string): Observable<any> {
    return this.http.delete(this.servicesConfig.APP_ENDPOINT + 'api/jueces/eliminar/' + idJuedge);
  }
  updateJudge( body: any) {
    return this.http.put(this.servicesConfig.APP_ENDPOINT + 'api/jueces/modificar', body);
  }
}
