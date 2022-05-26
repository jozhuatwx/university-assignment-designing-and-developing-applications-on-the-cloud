import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BarcodeFormat } from '@zxing/library';
import { Subscription } from 'rxjs';

import { PaymentApiService } from 'src/app/services/api/payment-api.service';

@Component({
  selector: 'app-pay-scanner',
  templateUrl: './pay-scanner.component.html',
  styleUrls: ['./pay-scanner.component.scss']
})
export class PayScannerComponent {

  availableDevices: MediaDeviceInfo[] = [];
  deviceCurrent: MediaDeviceInfo | undefined;

  // scanner options
  formats = [ BarcodeFormat.QR_CODE ];

  // states
  scan = true;
  loading = false;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];

  constructor(
    private paymentApiService: PaymentApiService,
    private snackBar: MatSnackBar
  ) { }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
  }

  onCodeResult(result: string): void {
    if (!this.loading) {
      this.scan = false;
      this.loading = true;
      // add to subscriptions
      this.subscriptions.push(
        this.paymentApiService.travel({ numberPlate: result })
          .subscribe({
            next: (status) => {
              // show message
              this.snackBar.open(status, 'OK');
              this.loading = false;
            },
            error: (error: HttpErrorResponse) => {
              // show error message
              this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
              this.loading = false;
              this.scan = true;
            }
          })
      );
    }
  }

  ngOnDestroy(): void {
    this.scan = false;
    this.loading = true;
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
