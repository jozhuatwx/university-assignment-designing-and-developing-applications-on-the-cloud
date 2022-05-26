import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, HostListener, OnDestroy, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

import { CanDeactivateComponent } from 'src/app/models/shared/can-deactivate-component.model';
import { User } from 'src/app/models/user.model';
import { UserApiService } from 'src/app/services/api/user-api.service';
import { UserNameFormControl, UserEmailFormControl, UserNewPasswordFormControl, UserPasswordFormControl, confirmPasswordValidator, UserConfirmPasswordErrorStateMatcher } from 'src/app/services/form-controls/user.form-control';
import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-register-user-form',
  templateUrl: './register-user-form.component.html'
})
export class RegisterUserFormComponent implements CanDeactivateComponent, OnDestroy {

  @Output() userChange = new EventEmitter<User>();

  // form group to register
  registerForm = new FormGroup({
    name: new UserNameFormControl(),
    email: new UserEmailFormControl(),
    profilePicture: new FormControl(),
    profilePictureFile: new FormControl(),
    newPassword: new FormGroup({
      newPassword: new UserNewPasswordFormControl(),
      confirmNewPassword: new UserPasswordFormControl()
    }, [
      confirmPasswordValidator
    ])
  });
  previewSrc: string | undefined;
  matcher = new ErrorStateMatcher();
  passwordMatcher = new UserConfirmPasswordErrorStateMatcher();

  // password states
  hideNewPassword = true;
  hideConfirmPassword = true;

  // states
  registering = false;

  // user roles options
  roles = User.roles;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    public userApiService: UserApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    if (this.userApiService.isAdmin()) {
      this.registerForm.addControl('role', new FormControl(0));
    } else {
      this.registerForm.addControl('stayLoggedIn', new FormControl(true));
    }
  }

  register(): void {
    // check if all fields are valid
    if (this.registerForm.valid) {
      // update state
      this.registering = true;
      // separate data type and file data
      const split = this.registerForm.get('profilePictureFile')?.value?.split('base64,');
      let file: string | undefined;
      let type: string | undefined;
      if (split) {
        type = split[0];
        file = split[1];
      }
      // add to subscriptions
      this.subscriptions.push(
        // create a new user
        this.userApiService.register({
          name: this.registerForm.get('name')?.value,
          email: this.registerForm.get('email')?.value,
          profilePictureFileBase64: this.previewSrc ? file : undefined,
          password: this.registerForm.get('newPassword.newPassword')?.value,
          role: this.registerForm.get('role')?.value
        }, this.registerForm.get('stayLoggedIn')?.value)
          .subscribe({
            next: (user) => {
              this.registerForm.markAsPristine();
              if (!this.userApiService.isAdmin()) {
                // redirect user to home page
                this.router.navigate(['/home']);
              } else {
                // show message
                this.snackBar.open('User is now registered', 'OK');
                // emit created
                this.userChange.emit(user);
              }
              // update state
              this.registering = false;
            },
            error: (error: HttpErrorResponse) => {
              // show error message
              this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
              // update state
              this.registering = false;
            }
          })
      );
    }
  }

  previewProfilePicture(e: any): void {
    if (e.target.files && e.target.files.length) {
      const file = e.target.files[0];
      // read image and display preview
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.previewSrc = result;
        // add image to register form
        this.registerForm.patchValue({
          profilePictureFile: result
        });
        this.registerForm.get('profilePictureFile')?.updateValueAndValidity();
      }
      reader.readAsDataURL(file);
    }
  }

  clearProfilePicture(): void {
    // clear selected file
    this.registerForm.patchValue({
      profilePicture: undefined,
      profilePictureFile: undefined
    });
    this.previewSrc = undefined;
  }

  canDeactivate(): Observable<boolean> | boolean {
    // open a dialog to warn leaving edited form without saving
    if (this.registerForm.dirty) {
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
    if (this.registerForm.dirty) {
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
