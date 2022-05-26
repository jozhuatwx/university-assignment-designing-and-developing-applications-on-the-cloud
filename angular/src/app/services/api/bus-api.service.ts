import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserApiService } from './user-api.service';
import { Bus, ComplexBusDto, CreateOrUpdateBusDto, NumberPlateOnlyBusDto, UpdateDriverBusDto } from 'src/app/models/bus.model';

@Injectable({
  providedIn: 'root'
})
export class BusApiService {

  // api url
  private readonly api = `${environment.apiUrl}/Buses`;

  constructor(
    private httpClient: HttpClient,
    private userApiService: UserApiService
  ) { }

  create(data: CreateOrUpdateBusDto): Observable<Bus> {
    // check if request user is admin
    if (this.userApiService.isAdmin()) {
      // create bus
      return this.httpClient.post<Bus>(this.api, data, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
    return throwError('Only admin can create a bus');
  }

  getAll(numberPlatesOnly?: boolean, detailed?: boolean, currentRouteId?: string): Observable<NumberPlateOnlyBusDto[] | Bus[] | ComplexBusDto[]> {
    let params = new HttpParams();
    if (numberPlatesOnly) {
      params = params.append('NumberPlatesOnly', numberPlatesOnly)
    }
    if (detailed) {
      params = params.append('Detailed', detailed);
    }
    if (currentRouteId) {
      params = params.append('CurrentRouteId', currentRouteId);
    }
    // get buses with station names and disinfection times
    return this.httpClient.get<NumberPlateOnlyBusDto[] | Bus[] | ComplexBusDto[]>(`${this.api}`, { params: params, headers: { 'user-id': this.userApiService.getCurrentUser().id } });
  }

  get(numberPlate: string): Observable<ComplexBusDto> {
    // get bus
    return this.httpClient.get<ComplexBusDto>(`${this.api}/${numberPlate}`, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
  }

  update(data: CreateOrUpdateBusDto, id: string): Observable<string> {
    // check if request user is admin
    if (this.userApiService.isAdmin()) {
      // update bus
      return this.httpClient.put<string>(`${this.api}/${id}`, data, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
    return throwError('Only admin can update bus');
  }

  updateDriver(data: UpdateDriverBusDto, numberPlate: string): Observable<string> {
    // check if request user is driver
    if (this.userApiService.isDriver()) {
      // update bus
      return this.httpClient.put<string>(`${this.api}/${numberPlate}`, data, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
    return throwError('Only driver can update bus');
  }

  delete(id: string): Observable<string> {
    // check if request user is admin
    if (this.userApiService.isAdmin()) {
      // delete bus
      return this.httpClient.delete<string>(`${this.api}/${id}`, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
    return throwError('Only admin can delete bus');
  }
}
