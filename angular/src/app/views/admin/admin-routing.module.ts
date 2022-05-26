import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeactivateGuardService } from 'src/app/services/guards/deactivate.guard';

import { AccountsComponent } from './accounts/accounts.component';
import { BusesComponent } from './buses/buses.component';
import { PaymentsComponent } from './payments/payments.component';
import { RoutesComponent } from './routes/routes.component';
import { StationsComponent } from './stations/stations.component';
import { ZonesComponent } from './zones/zones.component';

const routes: Routes = [
  {
    path: 'accounts',
    component: AccountsComponent,
    canDeactivate: [ DeactivateGuardService ]
  },
  {
    path: 'buses',
    component: BusesComponent,
    canDeactivate: [ DeactivateGuardService ]
  },
  {
    path: 'payments',
    component: PaymentsComponent,
    canDeactivate: [ DeactivateGuardService ]
  },
  {
    path: 'routes',
    component: RoutesComponent,
    canDeactivate: [ DeactivateGuardService ]
  },
  {
    path: 'stations',
    component: StationsComponent,
    canDeactivate: [ DeactivateGuardService ]
  },
  {
    path: 'zones',
    component: ZonesComponent,
    canDeactivate: [ DeactivateGuardService ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class AdminRoutingModule { }
