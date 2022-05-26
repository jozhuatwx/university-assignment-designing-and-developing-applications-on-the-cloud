import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { NumberPlateOnlyBusDto } from 'src/app/models/bus.model';
import { BusApiService } from 'src/app/services/api/bus-api.service';
import { AutocompleteFormControl } from 'src/app/services/form-controls/autocomplete.form-control';

@Component({
  selector: 'app-bus-scanner',
  templateUrl: './bus-scanner.component.html',
  styleUrls: ['./bus-scanner.component.scss']
})
export class BusScannerComponent implements OnInit, OnDestroy {

  availableDevices: MediaDeviceInfo[] = [];
  deviceCurrent: MediaDeviceInfo | undefined;

  buses: NumberPlateOnlyBusDto[] = [];

  searchControl = new AutocompleteFormControl();
  filteredBuses: Observable<NumberPlateOnlyBusDto[]> | undefined;
  matcher = new ErrorStateMatcher();

  scan = false;
  formats = [ BarcodeFormat.QR_CODE ];

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private busApiService: BusApiService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // add to subscriptions
    this.subscriptions.push(
      this.busApiService.getAll(true)
        .subscribe({
          next: (buses) => {
            // get buses
            this.buses = buses;
            // update search control with validation
            this.searchControl = new AutocompleteFormControl(this.buses.map(bus => bus.numberPlate));
            // update autocomplete with suggestions
            this.filteredBuses = this.searchControl.valueChanges
              .pipe(
                startWith(''),
                map(keyword => keyword ? this.filter(keyword.toLowerCase()) : this.buses.slice())
              );
          },
          error: (error) => {
            // show error message
            this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
          }
        })
      );
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
  }

  onCodeResult(result: string): void {
    if (result && this.buses.find(bus => bus.numberPlate === result)) {
      this.scan = false;
      this.router.navigate(['/driver/buses/', result]);
    }
  }

  select(): void {
    if (this.searchControl.valid) {
      this.scan = false;
      this.router.navigate(['/driver/buses/', this.searchControl.value])
    }
  }

  private filter(keyword: string): NumberPlateOnlyBusDto[] {
    // filter buses to those with the keyword only
    return this.buses.filter(bus => bus.numberPlate.toLowerCase().includes(keyword));
  }

  ngOnDestroy(): void {
    this.scan = false;
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
