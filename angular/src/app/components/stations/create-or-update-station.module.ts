import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { CreateOrUpdateStationDialogComponent } from './create-or-update-station-dialog/create-or-update-station-dialog.component';
import { CreateOrUpdateStationFormComponent } from './create-or-update-station-form/create-or-update-station-form.component';

@NgModule({
  declarations: [
    CreateOrUpdateStationDialogComponent,
    CreateOrUpdateStationFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  exports: [
    CreateOrUpdateStationDialogComponent,
    CreateOrUpdateStationFormComponent
  ]
})
export class CreateOrUpdateStationModule { }
