import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { UpdateUserDialogData } from 'src/app/models/shared/dialog-data.model';

@Component({
  selector: 'app-update-user-dialog',
  templateUrl: './update-user-dialog.component.html'
})
export class UpdateUserDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UpdateUserDialogData
  ) { }
}
