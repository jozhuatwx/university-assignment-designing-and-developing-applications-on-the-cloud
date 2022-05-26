import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { startWith, map, mergeMap } from 'rxjs/operators';

import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { ComplexBusDto } from 'src/app/models/bus.model';
import { NameOnlyRouteDto, Route } from 'src/app/models/route.model';
import { CanDeactivateComponent } from 'src/app/models/shared/can-deactivate-component.model';
import { NameOnlyStationDto } from 'src/app/models/station.model';
import { BusApiService } from 'src/app/services/api/bus-api.service';
import { RouteApiService } from 'src/app/services/api/route-api.service';
import { AutocompleteFormControl } from 'src/app/services/form-controls/autocomplete.form-control';

@Component({
  selector: 'app-bus-detailed',
  templateUrl: './bus-detailed.component.html',
  styleUrls: ['./bus-detailed.component.scss']
})
export class BusDetailedComponent implements OnInit, CanDeactivateComponent, OnDestroy {

  // routes and bus details
  routes: NameOnlyRouteDto[] = [];
  bus: ComplexBusDto | undefined;

  currentRoute: Route | undefined;
  stations: NameOnlyStationDto[] | undefined;
  currentStationIndex = 0;
  prevStationIndex = 0;
  nextStationIndex = 0;

  searchControl = new AutocompleteFormControl();
  filteredRoutes: Observable<NameOnlyRouteDto[]> | undefined;
  matcher = new ErrorStateMatcher();

  // states
  loading = [false, false];

  // subscriptions to unsubcribe
  private subscriptions: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private busApiService: BusApiService,
    private routeApiService: RouteApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loading = [true, true];
    const numberPlate = this.activatedRoute.snapshot.params.numberPlate;
    // add to subscriptions
    this.subscriptions.push(
      this.busApiService.get(numberPlate)
        .subscribe({
          next: (bus) => {
            // get bus
            this.bus = bus;

            if (bus.currentRouteId) {
              this.getAndUpdateRouteAndStations(bus.currentRouteId);
            }
            this.loading[0] = false;
          },
          error: (error: HttpErrorResponse) => {
            // show error message
            this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
            this.loading[0] = false;
          }
        })
    );

    // add to subscriptions
    this.subscriptions.push(
      this.routeApiService.getAll(true)
        .subscribe({
          next: (routes) => {
            // get routes
            this.routes = routes;
            // update search control with validation
            this.searchControl = new AutocompleteFormControl(this.routes.map(route => route.name));
            // update autocomplete with suggestions
            this.filteredRoutes = this.searchControl.valueChanges
              .pipe(
                startWith(''),
                map(keyword => keyword ? this.filter(keyword.toLowerCase()) : this.routes.slice())
              );
            this.loading[1] = false;
          },
          error: (error: HttpErrorResponse) => {
            // show error message
            this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
            this.loading[1] = false;
          }
        })
    );
  }

  selectRoute(): void {
    if (this.searchControl.valid && this.bus) {
      const selectedRouteId = this.routes.find(route => route.name === this.searchControl.value)?.id;
      if (selectedRouteId) {
        // add to subscriptions
        this.subscriptions.push(
          this.busApiService.updateDriver({ currentRouteId: selectedRouteId }, this.bus.numberPlate)
            .subscribe({
              next: (status) => {
                if (this.bus) {
                  this.bus.currentRouteId = selectedRouteId;
                }
                this.getAndUpdateRouteAndStations(selectedRouteId);
                // show message
                this.snackBar.open(status, 'OK');
              },
              error: (error: HttpErrorResponse) => {
                // show error message
                this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
              }
            })
        );
      }
    }
  }

  stopRoute(): void {
    if (this.bus) {
      // add to subscriptions
      this.subscriptions.push(
        this.busApiService.updateDriver({ stopRoute: true }, this.bus.numberPlate)
          .subscribe({
            next: (status) => {
              if (this.bus) {
                // clear current status
                this.bus.currentUsage = 0;
                this.bus.currentRouteId = undefined;
                this.currentRoute = undefined;
                this.stations = undefined;
                this.bus.stationName = undefined;
              }
              this.searchControl.enable();
              // show message
              this.snackBar.open(status, 'OK');
            },
            error: (error: HttpErrorResponse) => {
              // show error message
              this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
            }
          })
      );
    }
  }

  updateUsage(usage: number): void {
    if (this.bus) {
      const currentUsage = this.bus.currentUsage + usage;
      // add to subscriptions
      this.subscriptions.push(
        this.busApiService.updateDriver({ currentUsage: currentUsage }, this.bus.numberPlate)
          .subscribe({
            next: (status) => {
              if (this.bus) {
                this.bus.currentUsage = currentUsage;
              }
              // show message
              this.snackBar.open(status, 'OK');
            },
            error: (error: HttpErrorResponse) => {
              // show error message
              this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
            }
          })
      );
    }
  }

  updateStation(index: number): void {
    if (this.bus && this.stations) {
      const station = this.stations[index];
      // add to subscriptions
      this.subscriptions.push(
        this.busApiService.updateDriver({ stationId: station.id }, this.bus.numberPlate)
          .subscribe({
            next: (status) => {
              if (this.bus) {
                this.bus.stationName = station.name;
                this.updateStationOptions();
              }
              // show message
              this.snackBar.open(status, 'OK');
            },
            error: (error: HttpErrorResponse) => {
              // show error message
              this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
            }
          })
      );
    }
  }

  disinfect(): void {
    if (this.bus) {
      // add to subscriptions
      this.subscriptions.push(
        this.busApiService.updateDriver({ disinfected: true }, this.bus.numberPlate)
          .subscribe({
            next: (status) => {
              if (this.bus) {
                this.bus.disinfectionTime = Date.now();
              }
              // show message
              this.snackBar.open(status, 'OK');
            },
            error: (error: HttpErrorResponse) => {
              // show error message
              this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
            }
          })
      );
    }
  }

  private getAndUpdateRouteAndStations(routeId: string): void {
    this.loading[0] = true;
    // add to subscriptions
    this.subscriptions.push(
      this.routeApiService.get(routeId)
        .subscribe({
          next: (route) => {
            // get route
            this.currentRoute = route;
            this.searchControl.setValue(route.name);
            this.searchControl.disable();
            // get stations
            this.stations = route.stations;
            // update previous and next station options
            this.updateStationOptions();
            this.loading[0] = false;
          },
          error: (error: HttpErrorResponse) => {
            // show error message
            this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
            this.loading[0] = false;
          }
        })
    )
  };

  private updateStationOptions(): void {
    if (this.stations) {
      const index = this.stations.findIndex(station => station.name === this.bus?.stationName);
      if (index >= 0) {
        this.currentStationIndex = index;
      } else {
        this.currentStationIndex = 0;
        if (this.bus) {
          this.bus.stationName = this.stations[0].name;
        }
      }
      this.prevStationIndex = this.currentStationIndex - 1 >= 0 ? this.currentStationIndex - 1 : this.stations.length - 1;
      this.nextStationIndex = this.stations.length > this.currentStationIndex + 1 ? this.currentStationIndex + 1 : 0;
    }
  }

  private filter(keyword: string): NameOnlyRouteDto[] {
    // filter routes to those with the keyword only
    return this.routes.filter(route => route.name.toLowerCase().includes(keyword));
  }

  canDeactivate(): Observable<boolean> | boolean {
    // open a dialog to warn leaving
    return this.dialog.open(DialogComponent, {
      data: {
        title: 'Warning',
        question: 'Leaving. Do you confirm?'
      }
    }).afterClosed();
  }

  @HostListener('window:beforeunload', ['$event'])
  canUnload($event: BeforeUnloadEvent): BeforeUnloadEvent {
    // warn leaving
    $event.preventDefault();
    $event.returnValue = 'Leaving.';
    return $event;
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
