import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-register-user-dialog',
  templateUrl: './register-user-dialog.component.html'
})
export class RegisterUserDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>
  ) { }
}
