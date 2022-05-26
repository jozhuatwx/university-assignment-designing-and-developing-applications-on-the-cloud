import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { UserApiService } from '../api/user-api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardService implements CanActivate {

  constructor(
    private router: Router,
    private userApiService: UserApiService
  ) { }

  canActivate(): boolean {
    if (!this.userApiService.isAdmin()) {
      // redirect user to home page if not admin
      this.router.navigate(['/home']);
      return false;
    }
    return true;
  }
}
