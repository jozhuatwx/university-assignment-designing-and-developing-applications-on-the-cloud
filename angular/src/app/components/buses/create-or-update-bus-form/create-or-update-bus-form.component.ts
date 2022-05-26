import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { ComplexBusDto } from 'src/app/models/bus.model';
import { BusApiService } from 'src/app/services/api/bus-api.service';
import { BusNumberPlateFormControl, BusCapacityPlateFormControl } from 'src/app/services/form-controls/bus.form-control';

@Component({
  selector: 'app-create-or-update-bus-form',
  templateUrl: './create-or-update-bus-form.component.html'
})
export class CreateOrUpdateBusFormComponent implements OnChanges, OnDestroy {

  @Input() bus: ComplexBusDto | undefined;
  @Output() busChange = new EventEmitter<ComplexBusDto>();

  // form group to create or update bus
  createOrUpdateForm = new FormGroup({
    numberPlate: new BusNumberPlateFormControl(),
    capacity: new BusCapacityPlateFormControl()
  });
  matcher = new ErrorStateMatcher();

  // states
  processing = false;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];
  
  constructor(
    private busApiService: BusApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.bus && changes.bus.currentValue && this.bus) {
      this.createOrUpdateForm.patchValue({
        numberPlate: this.bus.numberPlate,
        capacity: this.bus.capacity
      });
    }
  }

  submit(): void {
    // check if all fields are valid
    if (this.createOrUpdateForm.valid) {
      // update state
      this.processing = true;
      if (this.bus?.id) {
        // add to subscriptions
        this.subscriptions.push(
          // update bus
          this.busApiService.update({
            numberPlate: this.createOrUpdateForm.get('numberPlate')?.value,
            capacity: this.createOrUpdateForm.get('capacity')?.value
          }, this.bus.id)
            .subscribe({
              next: (status) => {
                // show message
                this.snackBar.open(status, 'OK');
                // set update form as unedited
                this.createOrUpdateForm.markAsPristine();
                // emit change
                if (this.bus?.id) {
                  this.busChange.emit({
                    id: this.bus.id,
                    numberPlate: this.createOrUpdateForm.get('numberPlate')?.value,
                    capacity: this.createOrUpdateForm.get('capacity')?.value,
                    currentUsage: this.bus.currentUsage,
                    currentRouteId: this.bus.currentRouteId,
                    stationName: this.bus.stationName,
                    disinfectionTime: this.bus.disinfectionTime
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
          // create a new bus
          this.busApiService.create({
            numberPlate: this.createOrUpdateForm.get('numberPlate')?.value,
            capacity: this.createOrUpdateForm.get('capacity')?.value
          })
            .subscribe({
              next: (bus) => {
                // emit change
                this.busChange.emit(bus);
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
