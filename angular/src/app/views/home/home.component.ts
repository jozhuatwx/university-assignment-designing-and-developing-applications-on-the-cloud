import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { RouteApiService } from 'src/app/services/api/route-api.service';
import { isRoutes, Route } from 'src/app/models/route.model';
import { AutocompleteFormControl } from 'src/app/services/form-controls/autocomplete.form-control';
import { NameOnlyStationDto } from 'src/app/models/station.model';
import { StationApiService } from 'src/app/services/api/station-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  // stations and routes data
  stations: NameOnlyStationDto[] = [];
  routes: Route[] = [];

  searchControl = new AutocompleteFormControl(this.routes);
  filteredRoutes: Observable<Route[]> | undefined;
  matcher = new ErrorStateMatcher();

  // states
  loading = false;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private stationApiService: StationApiService,
    private routeApiService: RouteApiService,
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
            this.loading = false;
          }
          // update search control with validation
          this.searchControl = new AutocompleteFormControl(this.routes.map(route => route.name));
          // update autocomplete with suggestions
          this.filteredRoutes = this.searchControl.valueChanges
            .pipe(
              startWith(''),
              map(keyword => keyword ? this.filter(keyword.toLowerCase()) : this.routes.slice())
            );
        },
        error: (error: HttpErrorResponse) => {
          // show error message
          this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
          this.loading = false;
        }
      })
    );
  }

  select(): void {
    if (this.searchControl.valid) {
      const route = this.routes.find(route => route.name === this.searchControl.value);
      if (route) {
        this.router.navigate(['/home', 'routes', route.id]);
      }
    }
  }

  private filter(keyword: string): Route[] {
    // filter routes to those with the keyword only
    return this.routes.filter(route => route.name.toLowerCase().includes(keyword));
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
