import { FormControl, Validators } from '@angular/forms';

export class RouteNameFormControl extends FormControl {
  // set validators to required
  constructor() {
    super('', [
      Validators.required
    ]);
  }
}

export class RouteStationsFormControl extends FormControl {
  // set validators to required
  constructor() {
    super('', [
      Validators.required
    ]);
  }
}
