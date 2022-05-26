import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginGuardService } from 'src/app/services/guards/login.guard';
import { LogoutGuardService } from 'src/app/services/guards/logout.guard';
import { AdminGuardService } from 'src/app/services/guards/admin.guard';
import { DriverGuardService } from 'src/app/services/guards/driver.guard';
import { CustomerGuardService } from 'src/app/services/guards/customer.guard';
import { DeactivateGuardService } from './services/guards/deactivate.guard';

import { HomeComponent } from 'src/app/views/home/home.component';
import { LoginUserFormComponent } from 'src/app/components/user-accounts/login-user-form/login-user-form.component';
import { RegisterUserFormComponent } from 'src/app/components/user-accounts/register-user-form/register-user-form.component';
import { RouteDetailedComponent } from 'src/app/views/route-detailed/route-detailed.component';

const routes: Routes = [
  {
    path: 'home',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: HomeComponent
      },
      {
        path: 'routes/:id',
        component: RouteDetailedComponent
      }
    ]
  },
  {
    path: 'login',
    canActivate: [ LogoutGuardService ],
    component: LoginUserFormComponent,
    canDeactivate: [ DeactivateGuardService ]
  },
  {
    path: 'register',
    canActivate: [ LogoutGuardService ],
    component: RegisterUserFormComponent,
    canDeactivate: [ DeactivateGuardService ]
  },
  {
    path: 'admin',
    canActivate: [ LoginGuardService, AdminGuardService ],
    loadChildren: () => import('./views/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'driver',
    canActivate: [ LoginGuardService, DriverGuardService ],
    loadChildren: () => import('./views/driver/driver.module').then(m => m.DriverModule)
  },
  {
    path: 'customer',
    canActivate: [ LoginGuardService, CustomerGuardService ],
    loadChildren: () => import('./views/customer/customer.module').then(m => m.CustomerModule)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
