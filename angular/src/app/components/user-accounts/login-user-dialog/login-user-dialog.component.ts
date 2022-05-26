import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-login-user-dialog',
  templateUrl: './login-user-dialog.component.html'
})
export class LoginUserDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>
  ) { }
}
