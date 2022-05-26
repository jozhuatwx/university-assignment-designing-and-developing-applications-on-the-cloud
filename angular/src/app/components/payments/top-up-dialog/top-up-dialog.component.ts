import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-top-up-dialog',
  templateUrl: './top-up-dialog.component.html'
})
export class TopUpDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>
  ) { }
}
