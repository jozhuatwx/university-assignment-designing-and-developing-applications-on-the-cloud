import { FormControl, Validators } from '@angular/forms';
import { optionsValidator } from './options.validator';

export class AutocompleteFormControl extends FormControl {
  constructor(options?: any[]) {
    super('', [
      Validators.required,
      optionsValidator(options)
    ]);
  }
}
