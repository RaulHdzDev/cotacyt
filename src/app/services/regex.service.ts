import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegexService {

  constructor() { }
  regexPostalCode(): RegExp {
    return new RegExp('^[0-9]{5}$');
  }
  regexCURP(): RegExp {
    return new RegExp('^[A-Z][A,E,I,O,U,X][A-Z]{2}[0-9]{2}[0-1][0-9][0-3][0-9][M,H][A-Z]{2}[B,C,D,F,G,H,J,K,L,M,N,Ñ,P,Q,R,S,T,V,W,X,Y,Z]{3}[0-9,A-Z][0-9]$');
  }
  regexRFC(): RegExp {
    return new RegExp('^[A-Z,Ñ,&]{3,4}[0-9]{2}[0-1][0-9][0-3][0-9][A-Z,0-9]?[A-Z,0-9]?[0-9,A-Z]?$');
  }
  regexPhone(): RegExp {
    return new RegExp('^(\\d{3}[- .]?){2}\\d{4}$');
  }
}
