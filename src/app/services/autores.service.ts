import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServicesConfig } from '../config/services.config';
import { Observable } from 'rxjs';
import { Autores, AutorIds } from '../models/autores.model';
import { Session } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class AutoresService {
  sessionData: Session;
  constructor( private http: HttpClient, private servicesConfig: ServicesConfig ) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
  }
  getAutores(): Observable<Autores[]> {
    return this.http.get<Autores[]>( this.servicesConfig.APP_ENDPOINT
      + 'api/autores/all?id_sedes=' + this.sessionData.id_sedes);
  }
  postAutor( body: any ): Observable<any> {
    return this.http.post(this.servicesConfig.APP_ENDPOINT + 'api/autores/nuevo', body);
  }
  getAutoresSuperUser(): Observable<Autores[]> {
    return this.http.get<Autores[]>(this.servicesConfig.APP_ENDPOINT + '/api/autores/all-admin');
  }
  deleteAutores(idAutores: string): Observable<any> {
    return this.http.delete( this.servicesConfig.APP_ENDPOINT + 'api/autores/eliminar/' + idAutores);
  }
  updateAutor(body: any) {
    return this.http.put( this.servicesConfig.APP_ENDPOINT + 'api/autores/modificar', body);
  }
  getAutor(idAutor: string): Observable<AutorIds> {
    return this.http.get<AutorIds>( this.servicesConfig.APP_ENDPOINT + 'api/autores/' + idAutor);
  }
  getAutoresSelect(): Observable<Autores[]> {
    return this.http.get<Autores[]>(this.servicesConfig.APP_ENDPOINT
      + 'api/autores/all-list?id_sedes=' + this.sessionData.id_sedes);
  }
  getAutoresSelectSuperUser(idSede: string): Observable<Autores[]> {
    return this.http.get<Autores[]>(this.servicesConfig.APP_ENDPOINT
      + 'api/autores/all-list?id_sedes=' + idSede);
  }
  //apis de enlace
  getAllAutores(): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/autores`);
  }
  getAllAutoresSede(): Observable<any> {
    return this.http.get(`${this.servicesConfig.APP_ENDPOINT_LOCAL2}/autores/${this.sessionData.sede}`);
  }
}
