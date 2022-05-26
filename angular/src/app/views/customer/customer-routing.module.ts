import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeactivateGuardService } from 'src/app/services/guards/deactivate.guard';

import { BalanceComponent } from './balance/balance.component';
import { PayScannerComponent } from './pay-scanner/pay-scanner.component';

const routes: Routes = [
  {
    path: 'pay',
    component: PayScannerComponent,
    canDeactivate: [ DeactivateGuardService ]
  },
  {
    path: 'balance',
    component: BalanceComponent,
    canDeactivate: [ DeactivateGuardService ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class CustomerRoutingModule { }
