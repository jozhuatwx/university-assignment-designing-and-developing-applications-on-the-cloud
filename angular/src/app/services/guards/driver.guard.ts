import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { UserApiService } from '../api/user-api.service';

@Injectable({
  providedIn: 'root'
})
export class DriverGuardService implements CanActivate {

  constructor(
    private router: Router,
    private userApiService: UserApiService
  ) { }

  canActivate(): boolean {
    if (!this.userApiService.isDriver()) {
      // redirect user to home page if not driver
      this.router.navigate(['/home']);
      return false;
    }
    return true;
  }
}
