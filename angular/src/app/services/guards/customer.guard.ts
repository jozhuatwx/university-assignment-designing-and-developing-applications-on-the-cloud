import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { UserApiService } from '../api/user-api.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerGuardService implements CanActivate {

  constructor(
    private router: Router,
    private userApiService: UserApiService
  ) { }

  canActivate(): boolean {
    if (!this.userApiService.isCustomer()) {
      // redirect user to home page if not customer
      this.router.navigate(['/home']);
      return false;
    }
    return true;
  }
}
