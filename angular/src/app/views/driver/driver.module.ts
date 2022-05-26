import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { DriverRoutingModule } from './driver-routing.module';
import { BusScannerComponent } from './bus-scanner/bus-scanner.component';
import { BusDetailedComponent } from './bus-detailed/bus-detailed.component';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [
    BusScannerComponent,
    BusDetailedComponent
  ],
  imports: [
    CommonModule,
    DriverRoutingModule,
    RouterModule,
    ReactiveFormsModule,
    ZXingScannerModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } }
  ]
})
export class DriverModule { }
