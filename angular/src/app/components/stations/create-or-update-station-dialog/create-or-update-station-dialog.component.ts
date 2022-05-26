import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CreateOrUpdateStationDialogData } from 'src/app/models/shared/dialog-data.model';
import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-update-station-dialog',
  templateUrl: './create-or-update-station-dialog.component.html'
})
export class CreateOrUpdateStationDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateOrUpdateStationDialogData
  ) { }
}
