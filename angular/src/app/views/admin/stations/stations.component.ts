import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin, Subscription } from 'rxjs';

import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { CreateOrUpdateStationDialogComponent } from 'src/app/components/stations/create-or-update-station-dialog/create-or-update-station-dialog.component';
import { isStations, Station } from 'src/app/models/station.model';
import { Zone } from 'src/app/models/zone.model';
import { StationApiService } from 'src/app/services/api/station-api.service';
import { ZoneApiService } from 'src/app/services/api/zone-api.service';

@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html'
})
export class StationsComponent implements OnInit, OnDestroy {

  // get reference to html element
  @ViewChild(MatSort) sort: MatSort | undefined;

  // zones and stations data
  zones: Zone[] = [];
  stations: Station[] = [];

  // table options
  displayedColumns = ['id', 'name', 'zone', 'actions'];
  tableDataSource = new MatTableDataSource<Station>();

  // states
  loading = false;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];

  constructor(
    private zoneApiService: ZoneApiService,
    private stationApiService: StationApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loading = true;
    // add to subscriptions    
    this.subscriptions.push(
      forkJoin([
        this.zoneApiService.getAll(),
        this.stationApiService.getAll()
      ]).subscribe({
        next: ([zones, stations]) => {
          // get zones and stations
          this.zones = zones;
          if (isStations(stations)) {
            this.stations = stations;
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
    )
  }

  add(): void {
    // add to subscriptions
    this.subscriptions.push(
      this.dialog.open(CreateOrUpdateStationDialogComponent, {
        data: { zones: this.zones }
      }).afterClosed()
        .subscribe({
          next: (createdStation: Station) => {
            if (createdStation) {
              this.stations.unshift(createdStation);
              // generate table data source
              this.generateDataSource();
            }
          }
        })
    );
  }

  edit(station: Station): void {
    // add to subscriptions
    this.subscriptions.push(
      this.dialog.open(CreateOrUpdateStationDialogComponent, {
        data: { zones: this.zones, station: station }
      }).afterClosed()
        .subscribe({
          next: (updatedStation: Station) => {
            if (updatedStation) {
              this.stations[this.stations.findIndex(data => data.id === station.id)] = updatedStation;
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
      // open a dialog to warn deleting station
      this.dialog.open(DialogComponent, {
        data: {
          title: 'Warning',
          question: 'Deleting station. Are you sure?'
        }
      }).afterClosed()
        .subscribe({
          next: (confirm: boolean) => {
            if (confirm) {
              // add to subscriptions
              this.subscriptions.push(
                // delete station when confirmed
                this.stationApiService.delete(id)
                  .subscribe({
                    next: (status) => {
                      // show message
                      this.snackBar.open(status, 'OK');
                      this.stations = this.stations.filter(data => data.id !== id);
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
    this.tableDataSource = new MatTableDataSource(this.stations);
    if (this.sort) {
      this.tableDataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
