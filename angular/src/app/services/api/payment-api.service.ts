import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { environment } from 'src/environments/environment';
import { UserApiService } from './user-api.service';
import { BalanceWithPaymentDto, CreateOrUpdateTravelPaymentDto, CreateTopUpPaymentDto, Payment } from 'src/app/models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentApiService {

  // api url
  private readonly api = `${environment.apiUrl}/Payments`;

  constructor(
    private httpClient: HttpClient,
    private userApiService: UserApiService
  ) { }

  topUp(data: CreateTopUpPaymentDto, id?: string): Observable<Payment> {
    // check if requested user is the same with top up user or if requested user is admin
    if (id && (this.userApiService.getCurrentUser().id === id || this.userApiService.isAdmin())) {
      // create top up payment
      return this.httpClient.post<Payment>(`${this.api}/TopUp/${id}`, data, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    } else {
      // create top up payment
      return this.httpClient.post<Payment>(`${this.api}/TopUp`, data, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    }
  }

  travel(data: CreateOrUpdateTravelPaymentDto): Observable<string> {
    // create or update travel payment
    return this.httpClient.post<string>(`${this.api}/Travel`, data, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
  }

  getAll(id?: string): Observable<BalanceWithPaymentDto> {
    // get payments
    if (id) {
      return this.httpClient.get<BalanceWithPaymentDto>(`${this.api}/${id}`, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });
    } else if (this.userApiService.isAdmin()) {
      return this.httpClient.get<BalanceWithPaymentDto>(this.api, { headers: { 'user-id': this.userApiService.getCurrentUser().id } });        
    }
    return throwError('Only admin can view payments');
  }
}
