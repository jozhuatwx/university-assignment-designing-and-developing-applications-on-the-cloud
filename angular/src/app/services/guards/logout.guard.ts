import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { UserApiService } from '../api/user-api.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutGuardService implements CanActivate {

  constructor(
    private router: Router,
    private userApiService: UserApiService,
  ) { }

  canActivate(): boolean {
    if (this.userApiService.isAuthenticated()) {
      // redirect user to home page if authenticated
      this.router.navigate(['/home']);
      return false;
    }
    return true;
  }
}
