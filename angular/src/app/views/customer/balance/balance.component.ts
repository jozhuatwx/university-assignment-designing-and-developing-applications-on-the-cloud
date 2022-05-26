import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, Subscription } from 'rxjs';

import { TopUpDialogComponent } from 'src/app/components/payments/top-up-dialog/top-up-dialog.component';
import { Payment } from 'src/app/models/payment.model';
import { NameOnlyStationDto } from 'src/app/models/station.model';
import { PaymentApiService } from 'src/app/services/api/payment-api.service';
import { StationApiService } from 'src/app/services/api/station-api.service';
import { UserApiService } from 'src/app/services/api/user-api.service';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit, OnDestroy {

  // balance, payments, and station details
  balance = 0;
  payments: Payment[] = [];
  stations: NameOnlyStationDto[] = [];

  // states
  loading = false;

  // subscriptions to unsubcribe
  private subscriptions: Subscription[] = [];

  constructor(
    private userApiService: UserApiService,
    private paymentApiService: PaymentApiService,
    private stationApiService: StationApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loading = true;
    // add to subscriptions
    this.subscriptions.push(
      forkJoin([
        this.paymentApiService.getAll(this.userApiService.getCurrentUser().id),
        this.stationApiService.getAll(true, true)
      ]).subscribe({
          next: ([payments, stations]) => {
            // get balance, payments, and stations
            this.balance = payments.balance;
            this.payments = payments.payments;
            this.stations = stations;
            this.loading = false;
          },
          error: (error: HttpErrorResponse) => {
            // show error message
            this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
            this.loading = false;
          }
        })
    );
  }

  add(): void {
    // add to subscriptions
    this.subscriptions.push(
      this.dialog.open(TopUpDialogComponent)
        .afterClosed()
        .subscribe({
          next: (newTopUpPayment: Payment) => {
            if (newTopUpPayment) {
              this.payments.unshift(newTopUpPayment);
              this.balance += newTopUpPayment.amount;
            }
          }
        })
    );
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
