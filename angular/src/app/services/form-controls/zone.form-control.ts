import { FormControl, Validators } from '@angular/forms';

export class ZoneNameFormControl extends FormControl {
  // set validators to required
  constructor() {
    super('', [
      Validators.required
    ]);
  }
}

export class ZoneLocationValueFormControl extends FormControl {
  // set validators to required
  constructor() {
    super(0, [
      Validators.required,
      Validators.min(0)
    ]);
  }
}
