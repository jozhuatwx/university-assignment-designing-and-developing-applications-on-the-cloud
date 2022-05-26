import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

import { BusQrCodeDialogComponent } from './bus-qr-code-dialog/bus-qr-code-dialog.component';

@NgModule({
  declarations: [
    BusQrCodeDialogComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    NgxQRCodeModule
  ],
  exports: [
    BusQrCodeDialogComponent
  ]
})
export class BusQrCodeDialogModule { }
