import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UpdateZoneDialogData } from 'src/app/models/shared/dialog-data.model';
import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-create-or-update-zone-dialog',
  templateUrl: './create-or-update-zone-dialog.component.html'
})
export class CreateOrUpdateZoneDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: UpdateZoneDialogData
  ) { }
}
