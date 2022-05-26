import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { Route } from 'src/app/models/route.model';
import { Station } from 'src/app/models/station.model';
import { RouteApiService } from 'src/app/services/api/route-api.service';
import { RouteNameFormControl, RouteStationsFormControl } from 'src/app/services/form-controls/route.form-control';

@Component({
  selector: 'app-create-or-update-route-form',
  templateUrl: './create-or-update-route-form.component.html',
  styleUrls: ['./create-or-update-route-form.component.scss']
})
export class CreateOrUpdateRouteFormComponent implements OnChanges, OnDestroy {

  @Input() stations: Station[] = [];
  @Input() route: Route | undefined;
  @Output() routeChange = new EventEmitter<Route>();

  // form group to create or update route
  createOrUpdateForm = new FormGroup({
    name: new RouteNameFormControl(),
    stations: new RouteStationsFormControl(),
    selectedStation: new FormControl()
  });
  matcher = new ErrorStateMatcher();

  selectedStations: Station[] = [];

  // states
  processing = false;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];
  
  constructor(
    private routeApiService: RouteApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.route && changes.route.currentValue && this.route && this.route.stations) {
      this.createOrUpdateForm.patchValue({
        name: this.route.name,
        selectedStation: this.stations[0]
      });
      this.selectedStations = this.route.stations;
    } else if (changes.stations && changes.stations.currentValue) {
      this.createOrUpdateForm.patchValue({
        selectedStation: this.stations[0]
      });
    }
  }

  swap(index1: number, index2: number): void {
    const tempStation = this.selectedStations[index1];
    this.selectedStations[index1] = this.selectedStations[index2];
    this.selectedStations[index2] = tempStation;
  }

  submit(): void {
    this.createOrUpdateForm.patchValue({
      stations: this.selectedStations
    });
    // check if all fields are valid
    if (this.createOrUpdateForm.valid) {
      // update state
      this.processing = true;
      if (this.route?.id) {
        // add to subscriptions
        this.subscriptions.push(
          // update route
          this.routeApiService.update({
            name: this.createOrUpdateForm.get('name')?.value,
            stationIds: this.createOrUpdateForm.get('stations')?.value.map((station: Station) => station.id)
          }, this.route.id)
            .subscribe({
              next: (status) => {
                // show message
                this.snackBar.open(status, 'OK');
                // set update form as unedited
                this.createOrUpdateForm.markAsPristine();
                // emit change
                if (this.route?.id) {
                  this.routeChange.emit({
                    id: this.route.id,
                    name: this.createOrUpdateForm.get('name')?.value,
                    stations: this.createOrUpdateForm.get('stations')?.value,
                    hasBuses: this.route.hasBuses
                  });
                }
                // update state
                this.processing = false;
              },
              error: (error: HttpErrorResponse) => {
                // show error message
                this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
                  // update state
                this.processing = false;
              }
            })
        );
      } else {
        // add to subscriptions
        this.subscriptions.push(
          // create a new route
          this.routeApiService.create({
            name: this.createOrUpdateForm.get('name')?.value,
            stationIds: this.createOrUpdateForm.get('stations')?.value.map((station: Station) => station.id)
          })
            .subscribe({
              next: (route) => {
                // emit change
                this.routeChange.emit(route);
                // update state
                this.processing = false;
              },
              error: (error: HttpErrorResponse) => {
                // show error message
                this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
                  // update state
                this.processing = false;
              }
            })
        );
      }
    }
  }

  addStation(): void {
    if (this.createOrUpdateForm.get('selectedStation')?.valid) {
      this.selectedStations.push(this.createOrUpdateForm.get('selectedStation')?.value);
    }
  }

  removeStation(index: number): void {
    this.selectedStations.splice(index, 1);
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
