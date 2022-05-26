import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { User } from 'src/app/models/user.model';
import { UserApiService } from 'src/app/services/api/user-api.service';
import { UserNameFormControl, UserEmailFormControl, UserConfirmPasswordErrorStateMatcher, UserPasswordFormControl, UserNewPasswordFormControl, confirmPasswordValidator } from 'src/app/services/form-controls/user.form-control';

@Component({
  selector: 'app-update-user-form',
  templateUrl: './update-user-form.component.html'
})
export class UpdateUserFormComponent implements OnInit, OnDestroy {

  @Input() user = new User();
  @Output() userChange = new EventEmitter<User>();

  // form group to update user
  updateForm = new FormGroup({
    name: new UserNameFormControl(),
    email: new UserEmailFormControl(),
    profilePicture: new FormControl(),
    profilePictureFile: new FormControl(),
    updatePassword: new FormControl()
  });
  previewSrc: string | undefined;
  matcher = new ErrorStateMatcher();
  newPasswordMatcher = new UserConfirmPasswordErrorStateMatcher();

  // password states
  hidePassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  // states
  updating = false;

  // user roles options
  roles = User.roles;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];

  constructor(
    public userApiService: UserApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    if (this.userApiService.isAdmin()) {
      this.updateForm.addControl('role', new FormControl());
    }
  }

  ngOnInit(): void {
    // set user details in form
    this.updateForm.patchValue({
      name: this.user?.name,
      email: this.user?.email,
      updatePassword: false
    });
    this.previewSrc = this.user?.profilePictureFileUrl;

    if (this.userApiService.isAdmin()) {
      this.updateForm.patchValue({
        role: this.user?.role
      })
    }
  }

  updatePasswordToggle(event: MatSlideToggleChange): void {
    if (event.checked) {
      // add nested form group when update password
      this.updateForm.addControl('newPassword', new FormGroup({
        password: new UserPasswordFormControl(),
        newPassword: new UserNewPasswordFormControl(),
        confirmNewPassword: new UserPasswordFormControl()
      }, [
        confirmPasswordValidator
      ]));
    } else {
      // remove nested form group to prevent validation
      this.updateForm.removeControl('newPassword');
    }
  }

  update(): void {
    // check if all fields are valid
    if (this.updateForm.valid) {
      // update status
      this.updating = true;
      // separate data type and file data
      const split = this.updateForm.get('profilePictureFile')?.value?.split('base64,');
      let file: string | undefined;
      let type: string | undefined;
      if (split) {
        type = split[0];
        file = split[1];
      }
      // add to subscriptions
      this.subscriptions.push(
        // update user
        this.userApiService.update({
          name: this.updateForm.get('name')?.value,
          email: this.updateForm.get('email')?.value,
          profilePictureFileBase64: this.previewSrc ? file : undefined,
          removeProfilePicture: this.previewSrc ? false : true,
          updatePassword: this.updateForm.get('updatePassword')?.value,
          password: this.updateForm.get('newPassword.password')?.value,
          newPassword: this.updateForm.get('newPassword.newPassword')?.value,
          role: this.updateForm.get('role')?.value
        }, this.user.id, type)
          .subscribe({
            next: (status) => {
              // show message
              this.snackBar.open(status, 'OK');
              // set update form as unedited
              this.updateForm.markAsPristine();
              // update state
              this.updating = false;
              // emit updated
              this.userChange.emit({
                id: this.user.id,
                name: this.updateForm.get('name')?.value,
                email: this.updateForm.get('email')?.value,
                profilePictureFileUrl: this.previewSrc ? this.updateForm.get('profilePictureFile')?.value : undefined,
                role: this.updateForm.get('role')?.value
              });
            },
            error: (error: HttpErrorResponse) => {
              // show error message
              this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
              // update state
              this.updating = false;
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
        // add image to update form
        this.updateForm.patchValue({
          profilePictureFile: result
        });
        this.updateForm.get('profilePictureFile')?.updateValueAndValidity();
      }
      reader.readAsDataURL(file);
    }
  }

  clearProfilePicture(): void {
    // clear selected file
    this.updateForm.patchValue({
      profilePicture: undefined,
      profilePictureFile: undefined
    });
    this.previewSrc = undefined;
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
