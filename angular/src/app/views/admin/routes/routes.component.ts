import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin, Subscription } from 'rxjs';

import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { CreateOrUpdateRouteDialogComponent } from 'src/app/components/routes/create-or-update-route-dialog/create-or-update-route-dialog.component';
import { isRoutes, Route } from 'src/app/models/route.model';
import { NameOnlyStationDto } from 'src/app/models/station.model';
import { RouteApiService } from 'src/app/services/api/route-api.service';
import { StationApiService } from 'src/app/services/api/station-api.service';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html'
})
export class RoutesComponent implements OnInit, OnDestroy {

  // get reference to html element
  @ViewChild(MatSort) sort: MatSort | undefined;

  // stations and routes data
  stations: NameOnlyStationDto[] = [];
  routes: Route[] = [];

  // table options
  displayedColumns = ['id', 'name', 'stations', 'actions'];
  tableDataSource = new MatTableDataSource<Route>();

  // states
  loading = false;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];

  constructor(
    private stationApiService: StationApiService,
    private routeApiService: RouteApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loading = true;
    // add to subscriptions
    this.subscriptions.push(
      forkJoin([
        this.stationApiService.getAll(true),
        this.routeApiService.getAll()
      ]).subscribe({
        next: ([stations, routes]) => {
          // get stations and routes
          this.stations = stations;
          if (isRoutes(routes)) {
            this.routes = routes;
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
      this.dialog.open(CreateOrUpdateRouteDialogComponent, {
        data: { stations: this.stations }
      }).afterClosed()
        .subscribe({
          next: (createdRoute: Route) => {
            if (createdRoute) {
              this.routes.unshift(createdRoute);
              this.generateDataSource();
            }
          }
        })
    );
  }


  edit(route: Route): void {
    // add to subscriptions
    this.subscriptions.push(
      this.dialog.open(CreateOrUpdateRouteDialogComponent, {
        data: { stations: this.stations, route: route }
      }).afterClosed()
        .subscribe({
          next: (updatedRoute: Route) => {
            if (updatedRoute) {
              this.routes[this.routes.findIndex(data => data.id === route.id)] = updatedRoute;
              this.generateDataSource();
            }
          }
        })
    );
  }

  delete(id: string): void {
    // add to subscriptions
    this.subscriptions.push(
      // open a dialog to warn deleting route
      this.dialog.open(DialogComponent, {
        data: {
          title: 'Warning',
          question: 'Deleting route. Are you sure?'
        }
      }).afterClosed()
        .subscribe({
          next: (confirm: boolean) => {
            if (confirm) {
              // add to subscriptions
              this.subscriptions.push(
                // delete route when confirmed
                this.routeApiService.delete(id)
                  .subscribe({
                    next: (status) => {
                      // show message
                      this.snackBar.open(status, 'OK');
                      this.routes = this.routes.filter(data => data.id !== id);
                      this.generateDataSource();
                    },
                    error: (error: HttpErrorResponse) => {
                      // show error message
                      this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
                    }
                  })
              );
            }
          }
        })
    );
  }

  private generateDataSource(): void {
    // update table data
    this.tableDataSource = new MatTableDataSource(this.routes);
    if (this.sort) {
      this.tableDataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
