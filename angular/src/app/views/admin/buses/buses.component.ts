import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin, Subscription } from 'rxjs';

import { BusQrCodeDialogComponent } from 'src/app/components/buses/bus-qr-code-dialog/bus-qr-code-dialog.component';
import { CreateOrUpdateBusDialogComponent } from 'src/app/components/buses/create-or-update-bus-dialog/create-or-update-bus-dialog.component';
import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { ComplexBusDto, isComplexBuses } from 'src/app/models/bus.model';
import { isRoutes, Route } from 'src/app/models/route.model';
import { BusApiService } from 'src/app/services/api/bus-api.service';
import { RouteApiService } from 'src/app/services/api/route-api.service';

@Component({
  selector: 'app-buses',
  templateUrl: './buses.component.html'
})
export class BusesComponent implements OnInit, OnDestroy {

  // get reference to html element
  @ViewChild(MatSort) sort: MatSort | undefined;

  // routes and buses data
  routes: Route[] = [];
  buses: ComplexBusDto[] = [];

  // table options
  displayedColumns = ['id', 'numberPlate', 'capacity', 'currentUsage', 'currentRoute', 'stationName', 'disinfectionTime', 'actions'];
  tableDataSource = new MatTableDataSource<ComplexBusDto>();

  // states
  loading = false;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];

  constructor(
    private routeApiService: RouteApiService,
    private busApiService: BusApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loading = true;
    // add to subscriptions
    this.subscriptions.push(
      forkJoin([
        this.routeApiService.getAll(),
        this.busApiService.getAll(false, true)
      ]).subscribe({
          next: ([routes, buses]) => {
            // get routes and buses
            if (isRoutes(routes)) {
              this.routes = routes;
            }
            if (isComplexBuses(buses)) {
              this.buses = buses;
            }
            // generate table data source
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
      this.dialog.open(CreateOrUpdateBusDialogComponent)
        .afterClosed()
        .subscribe({
          next: (createdBus: ComplexBusDto) => {
            if (createdBus) {
              this.buses.unshift(createdBus);
              this.generateDataSource();
            }
          }
        })
    );
  }

  qrCode(numberPlate: string): void {
    this.dialog.open(BusQrCodeDialogComponent, {
      data: { numberPlate: numberPlate }
    });
  }

  edit(complexBus: ComplexBusDto): void {
    // add to subscriptions
    this.subscriptions.push(
      this.dialog.open(CreateOrUpdateBusDialogComponent, {
        data: { bus: complexBus }
      }).afterClosed()
        .subscribe({
          next: (updatedBus: ComplexBusDto) => {
            if (updatedBus) {
              this.buses[this.buses.findIndex(data => data.id === complexBus.id)] = updatedBus;
              this.generateDataSource();
            }
          }
        })
    );
  }

  delete(id: string): void {
    // add to subscriptions
    this.subscriptions.push(
      // open a dialog to warn deleting bus
      this.dialog.open(DialogComponent, {
        data: {
          title: 'Warning',
          question: 'Deleting bus. Are you sure?'
        }
      }).afterClosed()
        .subscribe({
          next: (confirm) => {
            if (confirm) {
              // add to subscriptions
              this.subscriptions.push(
                // delete bus when confirmed
                this.busApiService.delete(id)
                  .subscribe({
                    next: (status) => {
                      // show message
                      this.snackBar.open(status, 'OK');
                      this.buses = this.buses.filter(data => data.id !== id);
                      this.generateDataSource();
                    },
                    error: (error: HttpErrorResponse) => {
                      // show error message
                      this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
                    }
                  })
              )
            }
          }
        })
    );
  }

  private generateDataSource(): void {
    // update table data
    this.tableDataSource = new MatTableDataSource(this.buses);
    if (this.sort) {
      this.tableDataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
