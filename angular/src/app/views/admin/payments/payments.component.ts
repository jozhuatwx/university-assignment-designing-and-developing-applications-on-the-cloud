import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin, Subscription } from 'rxjs';

import { TopUpDialogComponent } from 'src/app/components/payments/top-up-dialog/top-up-dialog.component';
import { Payment } from 'src/app/models/payment.model';
import { NameOnlyStationDto } from 'src/app/models/station.model';
import { NameOnlyUserDto } from 'src/app/models/user.model';
import { PaymentApiService } from 'src/app/services/api/payment-api.service';
import { StationApiService } from 'src/app/services/api/station-api.service';
import { UserApiService } from 'src/app/services/api/user-api.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html'
})
export class PaymentsComponent implements OnInit, OnDestroy {

  // get reference to html element
  @ViewChild(MatSort) sort: MatSort | undefined;

  revenue = 0;
  stations: NameOnlyStationDto[] = [];
  payments: Payment[] = [];
  users: NameOnlyUserDto[] = [];

  // table options
  displayedColumns = ['id', 'userId', 'amount', 'type', 'startingStationId', 'endingStationId'];
  tableDataSource = new MatTableDataSource<Payment>();

  // states
  loading = false;

  // subscriptions to unsubcribe
  private subscriptions: Subscription[] = [];

  constructor(
    private userApiService: UserApiService,
    private stationApiService: StationApiService,
    private paymentApiService: PaymentApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loading = true;
    // add to subscriptions
    this.subscriptions.push(
      forkJoin([
        this.paymentApiService.getAll(),
        this.userApiService.getAll(true, true),
        this.stationApiService.getAll(true, true)
      ]).subscribe({
          next: ([balanceWithPayments, users, stations]) => {
            // get users, stations, revenue and payments
            this.users = users;
            this.stations = stations;
            this.revenue = Math.abs(balanceWithPayments.balance);
            this.payments = balanceWithPayments.payments;
            // generate table data sources
            this.generateDataSource();
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
              this.generateDataSource();
            }
          }
        })
    );
  }

  private generateDataSource(): void {
    // update table data
    this.tableDataSource = new MatTableDataSource(this.payments);
    if (this.sort) {
      this.tableDataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
