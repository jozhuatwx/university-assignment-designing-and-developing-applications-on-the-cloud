import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserApiService } from './user-api.service';
import { CreateOrUpdateRouteDto, NameOnlyRouteDto, Route } from 'src/app/models/route.model';

@Injectable({
  providedIn: 'root'
})
export class RouteApiService {

  // api url
  private readonly api = `${environment.apiUrl}/Routes`;

  constructor(
    private httpClient: HttpClient,
    private userApiService: UserApiService
  ) { }

  create(data: CreateOrUpdateRouteDto): Observable<Route> {
    // check if request user is admin
    if (this.userApiService.isAdmin()) {
      // create route
      return this.httpClient.post<Route>(this.api, data, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
    return throwError('Only admin can create a route');
  }

  getAll(namesOnly?: boolean): Observable<Route[] | NameOnlyRouteDto[]> {
    let params = new HttpParams();
    if (namesOnly) {
      params = params.append('NamesOnly', namesOnly);
    }
    // get routes
    return this.httpClient.get<Route[] | NameOnlyRouteDto[]>(this.api, { params: params, headers: { 'user-id': this.userApiService.getCurrentUser().id } });
  }

  get(id: string): Observable<Route> {
    // get route
    return this.httpClient.get<Route>(`${this.api}/${id}`, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
  }

  update(data: CreateOrUpdateRouteDto, id: string): Observable<string> {
    // check if request user is admin
    if (this.userApiService.isAdmin()) {
      // update route
      return this.httpClient.put<string>(`${this.api}/${id}`, data, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
    return throwError('Only admin can update route');
  }

  delete(id: string): Observable<string> {
    // check if request user is admin
    if (this.userApiService.isAdmin()) {
      // delete route
      return this.httpClient.delete<string>(`${this.api}/${id}`, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
    return throwError('Only admin can delete route');
  }
}
