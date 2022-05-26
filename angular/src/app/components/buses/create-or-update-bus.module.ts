import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { CreateOrUpdateBusDialogComponent } from './create-or-update-bus-dialog/create-or-update-bus-dialog.component';
import { CreateOrUpdateBusFormComponent } from './create-or-update-bus-form/create-or-update-bus-form.component';

@NgModule({
  declarations: [
    CreateOrUpdateBusDialogComponent,
    CreateOrUpdateBusFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  exports: [
    CreateOrUpdateBusDialogComponent,
    CreateOrUpdateBusFormComponent
  ]
})
export class CreateOrUpdateBusModule { }
