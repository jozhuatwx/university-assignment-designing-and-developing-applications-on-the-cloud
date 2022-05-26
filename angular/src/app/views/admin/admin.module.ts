import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { PipesModule } from 'src/app/services/pipes/pipes.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AdminRoutingModule } from './admin-routing.module';
import { BusQrCodeDialogModule } from 'src/app/components/buses/bus-qr-code.module';
import { CreateOrUpdateBusModule } from 'src/app/components/buses/create-or-update-bus.module';
import { DialogModule } from 'src/app/components/dialog/dialog.module';
import { TopUpModule } from 'src/app/components/payments/top-up.module';
import { CreateOrUpdateRouteModule } from 'src/app/components/routes/create-or-update-route.module';
import { CreateOrUpdateStationModule } from 'src/app/components/stations/create-or-update-station.module';
import { RegisterUserModule } from 'src/app/components/user-accounts/register-user.module';
import { UpdateUserModule } from 'src/app/components/user-accounts/update-user.module';
import { CreateOrUpdateZoneModule } from 'src/app/components/zones/create-or-update-zone.module';
import { AccountsComponent } from './accounts/accounts.component';
import { BusesComponent } from './buses/buses.component';
import { PaymentsComponent } from './payments/payments.component';
import { RoutesComponent } from './routes/routes.component';
import { StationsComponent } from './stations/stations.component';
import { ZonesComponent } from './zones/zones.component';

@NgModule({
  declarations: [
    AccountsComponent,
    BusesComponent,
    PaymentsComponent,
    RoutesComponent,
    StationsComponent,
    ZonesComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    RouterModule,
    PipesModule,
    MatToolbarModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    BusQrCodeDialogModule,
    CreateOrUpdateBusModule,
    DialogModule,
    TopUpModule,
    CreateOrUpdateRouteModule,
    CreateOrUpdateStationModule,
    RegisterUserModule,
    UpdateUserModule,
    CreateOrUpdateZoneModule,
    MatProgressSpinnerModule
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } }
  ]
})
export class AdminModule { }
