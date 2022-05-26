import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { UpdateBusDialogData } from 'src/app/models/shared/dialog-data.model';
import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-create-or-update-bus-dialog',
  templateUrl: './create-or-update-bus-dialog.component.html'
})
export class CreateOrUpdateBusDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: UpdateBusDialogData
  ) { }
}
