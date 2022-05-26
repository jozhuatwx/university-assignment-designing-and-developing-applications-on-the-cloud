import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawerMode } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { DialogComponent } from './components/dialog/dialog.component';
import { LoginUserDialogComponent } from './components/user-accounts/login-user-dialog/login-user-dialog.component';
import { UpdateUserDialogComponent } from './components/user-accounts/update-user-dialog/update-user-dialog.component';
import { UserRole } from './models/user.model';
import { UserApiService } from './services/api/user-api.service';

interface MenuLink {
  name: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  // sidenav options
  mode: MatDrawerMode = 'over';

  // menu links
  links: MenuLink[] = [];

  // state
  sidenavOpen = false;

  constructor(
    private router: Router,
    public userApiService: UserApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // update sidenav option
    this.resized();

    // subscribe to user change
    this.userApiService.userChange
      .subscribe({
        next: (user) => {
          // update menu according to role
          switch (user.role) {
            case UserRole.admin:
              this.links = [
                { name: 'Home', path: '/home', icon: 'dashboard' },
                { name: 'Accounts', path: '/admin/accounts', icon: 'manage_accounts' },
                { name: 'Buses', path: '/admin/buses', icon: 'directions_bus' },
                { name: 'Routes', path: '/admin/routes', icon: 'directions' },
                { name: 'Stations', path: '/admin/stations', icon: 'place' },
                { name: 'Zones', path: '/admin/zones', icon: 'map' },
                { name: 'Payments', path: '/admin/payments', icon: 'payment' }
              ];
              break;

            case UserRole.driver:
              this.links = [
                { name: 'Home', path: '/home', icon: 'dashboard' },
                { name: 'Scan', path: '/driver/buses', icon: 'qr_code_scanner' }
              ];
              break;

            default:
              this.links = [
                { name: 'Home', path: '/home', icon: 'dashboard' },
                { name: 'Pay', path: '/customer/pay', icon: 'qr_code_scanner' },
                { name: 'Balance', path: '/customer/balance', icon: 'account_balance_wallet' }
              ];
              break;
          }
        }
      });
  }

  login(): void {
    this.dialog.open(LoginUserDialogComponent);
  }

  edit(): void {
    this.dialog.open(UpdateUserDialogComponent, {
      data: { user: this.userApiService.getCurrentUser() }
    });
  }

  delete(): void {
    // open a dialog to warn deleting account
    this.dialog.open(DialogComponent, {
      data: {
        title: 'Warning',
        question: 'Deleting account. Are you sure?'
      }
    }).afterClosed()
      .subscribe({
        next: (confirm) => {
          if (confirm) {
            // delete user when confirmed
            this.userApiService.delete()
              .subscribe({
                next: (status) => {
                  // show message
                  this.snackBar.open(status, 'OK');
                  // redirect to home page
                  this.router.navigate(['/home']);
                },
                error: (error: HttpErrorResponse) => {
                  // show error message
                  this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
                }
              });
          }
        }
      })
  }
  
  logout(): void {
    // logout user
    this.userApiService.confirmLogout();
  }

  @HostListener('window:resize')
  resized(): void {
    // update sidenav option
    if (window.innerWidth > 550) {
      this.sidenavOpen = true;
      this.mode = 'side';
    } else {
      this.sidenavOpen = false;
      this.mode = 'over';
    }
  }
}
