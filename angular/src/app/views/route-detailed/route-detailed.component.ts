import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

import { ComplexBusDto, isBuses } from 'src/app/models/bus.model';
import { Route } from 'src/app/models/route.model';
import { Station } from 'src/app/models/station.model';
import { ZoneApiService } from 'src/app/services/api/zone-api.service';
import { RouteApiService } from 'src/app/services/api/route-api.service';
import { BusApiService } from 'src/app/services/api/bus-api.service';
import { Zone } from 'src/app/models/zone.model';

@Component({
  selector: 'app-route-detailed',
  templateUrl: './route-detailed.component.html',
  styleUrls: ['./route-detailed.component.scss']
})
export class RouteDetailedComponent implements OnInit, OnDestroy {

  // zones, route, stations, and buses details
  zones: Zone[] = [];
  route: Route | undefined;
  stations: Station[] = [];
  buses: ComplexBusDto[] = [];

  // states
  loading = false;

  // subscriptions to unsubcribe
  private subscriptions: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private zoneApiSerivce: ZoneApiService,
    private routeApiService: RouteApiService,
    private busApiService: BusApiService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loading = true;
    const routeId = this.activatedRoute.snapshot.params.id;
    // add to subscriptions
    this.subscriptions.push(
      forkJoin([
        this.zoneApiSerivce.getAll(),
        this.routeApiService.get(routeId),
        this.busApiService.getAll(false, true, routeId)
      ]).subscribe({
        next: ([zones, route, buses]) => {
          // get zones, route, stations and buses
          this.zones = zones;
          this.route = route;
          this.stations = route.stations;
          if (isBuses(buses)) {
            this.buses = buses;
            this.loading = false;
          }
        },
        error: (error: HttpErrorResponse) => {
          // show error message
          this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
          this.loading = false;
        }
      })
    );
  }

  back(): void {
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
