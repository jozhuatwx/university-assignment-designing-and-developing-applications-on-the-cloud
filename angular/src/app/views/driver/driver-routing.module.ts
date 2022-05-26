import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeactivateGuardService } from 'src/app/services/guards/deactivate.guard';

import { BusDetailedComponent } from './bus-detailed/bus-detailed.component';
import { BusScannerComponent } from './bus-scanner/bus-scanner.component';

const routes: Routes = [
  {
    path: 'buses',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: BusScannerComponent,
        canDeactivate: [ DeactivateGuardService ]
      },
      {
        path: ':numberPlate',
        component: BusDetailedComponent,
        canDeactivate: [ DeactivateGuardService ]
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class DriverRoutingModule { }
