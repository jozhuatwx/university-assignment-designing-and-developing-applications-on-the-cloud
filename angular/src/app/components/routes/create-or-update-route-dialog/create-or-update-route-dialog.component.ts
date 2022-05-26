import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CreateOrUpdateRouteDialogData } from 'src/app/models/shared/dialog-data.model';
import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-create-or-update-route-dialog',
  templateUrl: './create-or-update-route-dialog.component.html',
  styleUrls: ['./create-or-update-route-dialog.component.scss']
})
export class CreateOrUpdateRouteDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateOrUpdateRouteDialogData
  ) { }
}
