import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserApiService } from './user-api.service';
import { CreateOrUpdateZoneDto, Zone } from 'src/app/models/zone.model';

@Injectable({
  providedIn: 'root'
})
export class ZoneApiService {

  // api url
  private readonly api = `${environment.apiUrl}/Zones`;

  constructor(
    private httpClient: HttpClient,
    private userApiService: UserApiService
  ) { }

  create(data: CreateOrUpdateZoneDto): Observable<Zone> {
    // check if request user is admin
    if (this.userApiService.isAdmin()) {
      // create zone
      return this.httpClient.post<Zone>(this.api, data, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
    return throwError('Only admin can create a zone');
  }

  getAll(): Observable<Zone[]> {
    // get zones
    return this.httpClient.get<Zone[]>(this.api, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
  }

  update(data: CreateOrUpdateZoneDto, id: string): Observable<string> {
    // check if request user is admin
    if (this.userApiService.isAdmin()) {
      // update zone
      return this.httpClient.put<string>(`${this.api}/${id}`, data, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
    return throwError('Only admin can update zone');
  }

  delete(id: string): Observable<string> {
    // check if request user is admin
    if (this.userApiService.isAdmin()) {
      // delete zone
      return this.httpClient.delete<string>(`${this.api}/${id}`, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
    return throwError('Only admin can delete zone');
  }
}
