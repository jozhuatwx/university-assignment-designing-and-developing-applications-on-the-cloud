import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { UserApiService } from '../api/user-api.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuardService implements CanActivate {

  constructor(
    private router: Router,
    private userApiService: UserApiService
  ) { }

  canActivate(): boolean {
    if (!this.userApiService.isAuthenticated()) {
      // redirect user to login page if not authenticated
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
