import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, HostListener, OnDestroy, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

import { CanDeactivateComponent } from 'src/app/models/shared/can-deactivate-component.model';
import { UserRole } from 'src/app/models/user.model';
import { UserApiService } from 'src/app/services/api/user-api.service';
import { UserEmailFormControl, UserPasswordFormControl } from 'src/app/services/form-controls/user.form-control';
import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-login-user-form',
  templateUrl: './login-user-form.component.html',
  styleUrls: ['./login-user-form.component.scss']
})
export class LoginUserFormComponent implements CanDeactivateComponent, OnDestroy {

  @Output() close = new EventEmitter();

  // form group to login and register
  loginForm = new FormGroup({
    email: new UserEmailFormControl(),
    password: new UserPasswordFormControl(),
    stayLoggedIn: new FormControl(true)
  });
  matcher = new ErrorStateMatcher();

  // password states
  hidePassword = true;

  // states
  loggingIn = false;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private userApiService: UserApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  login(): void {
    // check if all fields are valid
    if (this.loginForm.valid) {
      // update state
      this.loggingIn = true;
      this.loginForm.disable();
      // add to subscriptions
      this.subscriptions.push(
        // get user details
        this.userApiService.login({
          email: this.loginForm.get('email')?.value,
          password: this.loginForm.get('password')?.value
        }, this.loginForm.get('stayLoggedIn')?.value)
          .subscribe({
            next: (role) => {
              this.loginForm.markAsPristine();
              switch (role) {
                case UserRole.admin:
                  // redirect admin to accounts page
                  this.router.navigate(['/admin', 'accounts']);
                  break;

                case UserRole.driver:
                  // redirect driver to bus scanner page
                  this.router.navigate(['/driver', 'buses']);
                  break;

                case UserRole.customer:
                  // redirect customer to pay scanner page
                  this.router.navigate(['/customer', 'pay']);
                  break;

                default:
                  // redirect user to home page
                  this.router.navigate(['/home']);
                  break;
              }
              // update state
              this.loggingIn = false;
              this.loginForm.enable();
              this.close.emit();
            },
            error: (error: HttpErrorResponse) => {
              // show error message
              this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
              // update state
              this.loggingIn = false;
              this.loginForm.enable();
            }
          })
      );
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    // open a dialog to warn leaving edited form without saving
    if (this.loginForm.dirty) {
      return this.dialog.open(DialogComponent, {
        data: {
          title: 'Warning',
          question: 'Changes you made may not be saved. Do you confirm?'
        }
      }).afterClosed();
    }
    return true;
  }

  @HostListener('window:beforeunload', ['$event'])
  canUnload($event: BeforeUnloadEvent): BeforeUnloadEvent {
    // warn leaving when edited form without saving
    if (this.loginForm.dirty) {
      $event.preventDefault();
      $event.returnValue = 'Changes you made may not be saved.';
    }
    return $event;
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
