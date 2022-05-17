import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SidebarComponent } from './system/sidebar/sidebar.component';
import { RegistrationComponent } from './system/registration/registration.component';
import { DashboardComponent } from './system/dashboard/dashboard.component';
import { ProjectsComponent } from './Components/Projects/projects/projects.component';
import { JudgesComponent } from './Components/Judges/judges/judges.component';
import { ProjectsRegisteredComponent } from './Components/Projects/projects-registered/projects-registered.component';
import { AdvisersRegisteredComponent } from './Components/Advisers/advisers-registered/advisers-registered.component';
import { AuthorsRegisteredComponent } from './Components/Authors/authors-registered/authors-registered.component';
import { EstadisticsComponent } from './estadistics/estadistics.component';
import { SedeComponent } from './Components/sede/sede.component';
import { AdminRegisteredComponent } from './Components/admins/admin-registered/admin-registered.component';
import { AddAuthorsComponent } from './Components/Authors/add-authors/add-authors.component';
import { AddAdviserComponent } from './Components/Advisers/add-adviser/add-adviser.component';
import { PeriodoComponent } from './Components/periodo/periodo.component';

const routes: Routes = [
  {
    path: '', component: LoginComponent
  },
  {
    path: 'home',
    component: SidebarComponent,
    children: [
      {
        path: 'dashboard', component: DashboardComponent
      },
      {
        path: 'judges', component: RegistrationComponent
      },
      {
        path: '', redirectTo: 'dashboard', pathMatch: 'full'
      },
      {
        path: 'projects', component: ProjectsComponent
      },
      {
        path: 'registered-judges', component: JudgesComponent
      },
      {
        path: 'sede', component: SedeComponent
      },
      {
        path: 'admins-registered', component: AdminRegisteredComponent
      },
      {
        path: 'projects-registered', component: ProjectsRegisteredComponent
      },
      {
        path: 'advisers-registered', component: AdvisersRegisteredComponent
      },
      {
        path: 'add-estadistics', component: EstadisticsComponent
      },
      {
        path: 'authors-registered', component: AuthorsRegisteredComponent
      },
      {
        path: 'periodos', component: PeriodoComponent
      },
      // {
      //   path: 'nuevo-autor', component: AddAuthorsComponent
      // },
      // {
      //   path: 'nuevo-asesor', component: AddAdviserComponent
      // }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    { useHash: true }
  )],
  exports: [RouterModule]
})
export class AppRoutingModule { }
