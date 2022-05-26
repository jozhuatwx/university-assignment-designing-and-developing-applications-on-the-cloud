import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserApiService } from './user-api.service';
import { CreateOrUpdateStationDto, NameOnlyStationDto, Station } from 'src/app/models/station.model';

@Injectable({
  providedIn: 'root'
})
export class StationApiService {

  // api url
  private readonly api = `${environment.apiUrl}/Stations`;

  constructor(
    private httpClient: HttpClient,
    private userApiService: UserApiService
  ) { }

  create(data: CreateOrUpdateStationDto): Observable<Station> {
    // check if request user is admin
    if (this.userApiService.isAdmin()) {
      // create station
      return this.httpClient.post<Station>(this.api, data, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
    return throwError('Only admin can create a station');
  }

  getAll(namesOnly?: boolean, includeDeleted?: boolean): Observable<Station[] | NameOnlyStationDto[]> {
    let params = new HttpParams();
    if (namesOnly) {
      params = params.append('NamesOnly', namesOnly);
    }
    if (includeDeleted) {
      params = params.append('IncludeDeleted', includeDeleted);
    }
    // get stations
    return this.httpClient.get<Station[] | NameOnlyStationDto[]>(this.api, { params: params, headers: { 'user-id': this.userApiService.getCurrentUser().id } });
  }

  update(data: CreateOrUpdateStationDto, id: string): Observable<string> {
    // check if request user is admin
    if (this.userApiService.isAdmin()) {
      // update station
      return this.httpClient.put<string>(`${this.api}/${id}`, data, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
    return throwError('Only admin can update station');
  }

  delete(id: string): Observable<string> {
    // check if request user is admin
    if (this.userApiService.isAdmin()) {
      // delete station
      return this.httpClient.delete<string>(`${this.api}/${id}`, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
    return throwError('Only admin can delete station');
  }
}
