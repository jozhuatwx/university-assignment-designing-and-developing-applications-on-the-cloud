import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { Station } from 'src/app/models/station.model';
import { Zone } from 'src/app/models/zone.model';
import { StationApiService } from 'src/app/services/api/station-api.service';
import { StationNameFormControl, StationZoneFormControl } from 'src/app/services/form-controls/station.form-control';

@Component({
  selector: 'app-create-or-update-station-form',
  templateUrl: './create-or-update-station-form.component.html'
})
export class CreateOrUpdateStationFormComponent implements OnChanges, OnDestroy {

  @Input() zones: Zone[] = [];
  @Input() station: Station | undefined;
  @Output() stationChange = new EventEmitter<Station>();

  // form group to create or update station
  createOrUpdateForm = new FormGroup({
    name: new StationNameFormControl(),
    zoneId: new StationZoneFormControl()
  });
  matcher = new ErrorStateMatcher();

  // states
  processing = false;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];

  constructor(
    private stationApiService: StationApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.station && changes.station.currentValue && this.station) {
      this.createOrUpdateForm.patchValue({
        name: this.station.name,
        zoneId: this.station.zoneId
      });
    } else if (changes.zones && changes.zones.currentValue && this.zones.length > 0) {
      this.createOrUpdateForm.patchValue({
        zoneId: this.zones[0].id
      });
    }
  }

  submit(): void {
    // check if all fields are valid
    if (this.createOrUpdateForm.valid) {
      // update state
      this.processing = true;
      if (this.station?.id) {
        // add to subscriptions
        this.subscriptions.push(
          // update station
          this.stationApiService.update({
            name: this.createOrUpdateForm.get('name')?.value,
            zoneId: this.createOrUpdateForm.get('zoneId')?.value
          }, this.station.id)
            .subscribe({
              next: (status) => {
                // show message
                this.snackBar.open(status, 'OK');
                // set update form as unedited
                this.createOrUpdateForm.markAsPristine();
                // emit change
                const zone = this.zones.find(zone => zone.id === this.createOrUpdateForm.get('zoneId')?.value);
                if (this.station?.id && zone) {
                  this.stationChange.emit({
                    id: this.station.id,
                    name: this.createOrUpdateForm.get('name')?.value,
                    zoneId: this.createOrUpdateForm.get('zoneId')?.value,
                    hasRoutes: this.station.hasRoutes
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
          // create a new station
          this.stationApiService.create({
            name: this.createOrUpdateForm.get('name')?.value,
            zoneId: this.createOrUpdateForm.get('zoneId')?.value
          })
            .subscribe({
              next: (station) => {
                // emit change
                this.stationChange.emit(station);
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

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
