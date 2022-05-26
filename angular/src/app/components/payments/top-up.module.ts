import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { TopUpDialogComponent } from './top-up-dialog/top-up-dialog.component';
import { TopUpFormComponent } from './top-up-form/top-up-form.component';

@NgModule({
  declarations: [
    TopUpDialogComponent,
    TopUpFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  exports: [
    TopUpDialogComponent,
    TopUpFormComponent
  ]
})
export class TopUpModule { }
