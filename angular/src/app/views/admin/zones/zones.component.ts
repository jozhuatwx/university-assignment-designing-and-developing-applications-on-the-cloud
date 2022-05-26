import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { CreateOrUpdateZoneDialogComponent } from 'src/app/components/zones/create-or-update-zone-dialog/create-or-update-zone-dialog.component';
import { Zone } from 'src/app/models/zone.model';
import { ZoneApiService } from 'src/app/services/api/zone-api.service';

@Component({
  selector: 'app-zones',
  templateUrl: './zones.component.html'
})
export class ZonesComponent implements OnInit, OnDestroy {

  // get reference to html element
  @ViewChild(MatSort) sort: MatSort | undefined;

  // zones data
  zones: Zone[] = [];

  // table options
  displayedColumns = ['id', 'name', 'locationValue', 'actions'];
  tableDataSource = new MatTableDataSource<Zone>();

  // states
  loading = false;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];

  constructor(
    private zoneApiService: ZoneApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loading = true;
    // add to subscriptions
    this.subscriptions.push(
      this.zoneApiService.getAll()
        .subscribe({
          next: (zones) => {
            // get zones
            this.zones = zones;
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
      this.dialog.open(CreateOrUpdateZoneDialogComponent)
        .afterClosed()
        .subscribe({
          next: (createdZone: Zone) => {
            if (createdZone) {
              this.zones.unshift(createdZone);
              this.generateDataSource();
            }
          }
        })
    );
  }

  edit(zone: Zone): void {
    // add to subscriptions
    this.subscriptions.push(
      this.dialog.open(CreateOrUpdateZoneDialogComponent, {
        data: { zone: zone }
      }).afterClosed()
        .subscribe({
          next: (updatedZone: Zone) => {
            if (updatedZone) {
              this.zones[this.zones.findIndex(data => data.id === zone.id)] = updatedZone;
              // generate table data source
              this.generateDataSource();
            }
          }
        })
    );
  }

  delete(id: string): void {
    // add to subscriptions
    this.subscriptions.push(
      // open a dialog to warn deleting zone
      this.dialog.open(DialogComponent, {
        data: {
          title: 'Warning',
          question: 'Deleting zone. Are you sure?'
        }
      }).afterClosed()
        .subscribe({
          next: (confirm) => {
            if (confirm) {
              // add to subscriptions
              this.subscriptions.push(
                // delete zone when confirmed
                this.zoneApiService.delete(id)
                  .subscribe({
                    next: (status) => {
                      // show message
                      this.snackBar.open(status, 'OK');
                      this.zones = this.zones.filter(data => data.id !== id);
                      // generate table data source
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
    this.tableDataSource = new MatTableDataSource(this.zones);
    if (this.sort) {
      this.tableDataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
