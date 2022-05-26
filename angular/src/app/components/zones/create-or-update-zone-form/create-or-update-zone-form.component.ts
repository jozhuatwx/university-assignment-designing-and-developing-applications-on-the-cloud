import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { Zone } from 'src/app/models/zone.model';
import { ZoneApiService } from 'src/app/services/api/zone-api.service';
import { ZoneNameFormControl, ZoneLocationValueFormControl } from 'src/app/services/form-controls/zone.form-control';

@Component({
  selector: 'app-create-or-update-zone-form',
  templateUrl: './create-or-update-zone-form.component.html'
})
export class CreateOrUpdateZoneFormComponent implements OnChanges, OnDestroy {

  @Input() zone: Zone | undefined;
  @Output() zoneChange = new EventEmitter<Zone>();

  // form group to create or update zone
  createOrUpdateForm = new FormGroup({
    name: new ZoneNameFormControl(),
    locationValue: new ZoneLocationValueFormControl()
  });
  matcher = new ErrorStateMatcher();

  // states
  processing = false;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];

  constructor(
    private zoneApiService: ZoneApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.zone && changes.zone.currentValue && this.zone) {
      this.createOrUpdateForm.patchValue({
        name: this.zone.name,
        locationValue: this.zone.locationValue
      });
    }
  }

  submit(): void {
    // check if all fields are valid
    if (this.createOrUpdateForm.valid) {
      // update state
      this.processing = true;
      if (this.zone?.id) {
        // add to subscriptions
        this.subscriptions.push(
          // update zone
          this.zoneApiService.update({
            name: this.createOrUpdateForm.get('name')?.value,
            locationValue: this.createOrUpdateForm.get('locationValue')?.value
          }, this.zone.id)
            .subscribe({
              next: (status) => {
                // show message
                this.snackBar.open(status, 'OK');
                // set update form as unedited
                this.createOrUpdateForm.markAsPristine();
                // emit change
                if (this.zone?.id) {
                  this.zoneChange.emit({
                    id: this.zone.id,
                    name: this.createOrUpdateForm.get('name')?.value,
                    locationValue: this.createOrUpdateForm.get('locationValue')?.value,
                    hasStations: this.zone.hasStations
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
          // create a new zone
          this.zoneApiService.create({
            name: this.createOrUpdateForm.get('name')?.value,
            locationValue: this.createOrUpdateForm.get('locationValue')?.value
          })
            .subscribe({
              next: (zone) => {
                // emit change
                this.zoneChange.emit(zone);
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
