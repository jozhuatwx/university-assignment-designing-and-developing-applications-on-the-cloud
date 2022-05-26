import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxQrcodeErrorCorrectionLevels } from '@techiediaries/ngx-qrcode';

import { BusQrDialogData } from 'src/app/models/shared/dialog-data.model';
import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-bus-qr-code-dialog',
  templateUrl: './bus-qr-code-dialog.component.html',
  styleUrls: ['./bus-qr-code-dialog.component.scss']
})
export class BusQrCodeDialogComponent {

  errorCorrectionLevel = NgxQrcodeErrorCorrectionLevels.MEDIUM;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BusQrDialogData
  ) { }

  downloadQr(): void {
    const qrcodeContainer = document.getElementsByClassName('qrcode')[0];
    if (qrcodeContainer && qrcodeContainer.firstChild) {
      const anchor = document.createElement('a');
      anchor.href = (qrcodeContainer.firstChild as HTMLImageElement).src;
      anchor.download = `QR-${this.data.numberPlate}`;
      anchor.click();
    }
  }
}
