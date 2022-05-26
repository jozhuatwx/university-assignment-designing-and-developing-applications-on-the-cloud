import { AbstractControl, FormControl, FormGroupDirective, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class UserNameFormControl extends FormControl {
  // set validators to required
  constructor() {
    super('', [
      Validators.required
    ]);
  }
}

export class UserEmailFormControl extends FormControl {
  // set validators to required and email format
  constructor() {
    super('', [
      Validators.required,
      Validators.pattern('^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})')
    ]);
  }
}

export class UserPasswordFormControl extends FormControl {
  // set validators to required
  constructor() {
    super('', [
      Validators.required
    ]);
  }
}

export class UserNewPasswordFormControl extends FormControl {
  // set validators to required and with pattern
  constructor() {
    super('', [
      Validators.required,
      // password is must be at least 8 characters and contains at least 1 uppercase letter, 1 lowercase letter, and 1 number
      Validators.pattern('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$')
    ]);
  }
}

export class UserConfirmPasswordErrorStateMatcher implements ErrorStateMatcher {
  // error state matcher to show error when new and confirm password fields do not match
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
    const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);

    return invalidCtrl || invalidParent;
  }
}

export function confirmPasswordValidator(group: AbstractControl): ValidationErrors | null {
  // custom validator to match new and confirm password fields
  const password = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmNewPassword')?.value
  return password === confirmPassword ? null : { notSame: true }
}
