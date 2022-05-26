import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PipesModule } from 'src/app/services/pipes/pipes.module';

import { CreateOrUpdateRouteDialogComponent } from './create-or-update-route-dialog/create-or-update-route-dialog.component';
import { CreateOrUpdateRouteFormComponent } from './create-or-update-route-form/create-or-update-route-form.component';

@NgModule({
  declarations: [
    CreateOrUpdateRouteDialogComponent,
    CreateOrUpdateRouteFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PipesModule
  ],
  exports: [
    CreateOrUpdateRouteDialogComponent,
    CreateOrUpdateRouteFormComponent
  ]
})
export class CreateOrUpdateRouteModule { }
