import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '../../models/session.model';
import { CategoriasService } from 'src/app/services/categorias.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @ViewChild('mobile', { static: true }) mobile: ElementRef;
  public toggleClass: boolean = false;
  public categoria: string;
  sessionData: Session;

  constructor(
    private router: Router,
    private categoriasService: CategoriasService,
    private _utilService: UtilService) {
    this.sessionData = JSON.parse(localStorage.getItem('session'));
    this.categoria = 'Cargando...';
  }
  admin: boolean;
  superuser: boolean;
  ngOnInit(): void {
    this.admin = false;
    this.superuser = false;
    this.categoriasService.getCategorias().subscribe(data => {
      this.categoria = data.categoria;
      if (this.sessionData.rol === 'admin') {
        this.admin = true;
        this._utilService._cargo = true;
      } else if (this.sessionData.rol === 'superuser') {
        this.admin = true;
        this.superuser = true;
        this._utilService._cargo = true;
      } else {
        this.admin = false;
        this.superuser = false;
        this._utilService._cargo = false;
      }
    });
  }

  cerrarSesion() {
    this._utilService.loading = true;
    setTimeout(() => {
      this._utilService.loading = false;
      localStorage.removeItem('session');
      window.location.reload();
      // this.router.navigateByUrl('/');
    }, 2000);
  }

  toggle() {
    if (!this.toggleClass) {
      this.toggleClass = true;
    } else {
      this.toggleClass = false;
    }
  }
}
