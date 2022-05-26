import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IdToNamePipe } from './id-to-name.pipe';
import { IdsToNamesPipe } from './ids-to-names.pipe';
import { JoinPipe } from './join.pipe';
import { PaymentTypePipe } from './payment-type.pipe';
import { UserRolePipe } from './user-role.pipe';
import { MapToIdsPipe } from './map-to-ids.pipe';

@NgModule({
  declarations: [
    IdToNamePipe,
    IdsToNamesPipe,
    JoinPipe,
    MapToIdsPipe,
    PaymentTypePipe,
    UserRolePipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    IdToNamePipe,
    IdsToNamesPipe,
    JoinPipe,
    MapToIdsPipe,
    PaymentTypePipe,
    UserRolePipe
  ]
})
export class PipesModule { }
