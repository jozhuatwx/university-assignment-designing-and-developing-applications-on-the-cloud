import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { CreateOrUpdateZoneDialogComponent } from './create-or-update-zone-dialog/create-or-update-zone-dialog.component';
import { CreateOrUpdateZoneFormComponent } from './create-or-update-zone-form/create-or-update-zone-form.component';

@NgModule({
  declarations: [
    CreateOrUpdateZoneDialogComponent,
    CreateOrUpdateZoneFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  exports: [
    CreateOrUpdateZoneDialogComponent,
    CreateOrUpdateZoneFormComponent
  ]
})
export class CreateOrUpdateZoneModule { }
