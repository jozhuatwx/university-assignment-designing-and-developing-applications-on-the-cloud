import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

export function optionsValidator(options?: any[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return options ? (options.find(option => option === control.value) ? null : { notFound: true }) : null;
  }
}
