import { FormControl, Validators } from '@angular/forms';
import { Route } from 'src/app/models/route.model';
import { optionsValidator } from './options.validator';

export class BusNumberPlateFormControl extends FormControl {
  // set validators to required
  constructor() {
    super('', [
      Validators.required
    ]);
  }
}

export class BusCapacityPlateFormControl extends FormControl {
  // set validators to required
  constructor() {
    super(40, [
      Validators.required,
      Validators.min(1)
    ]);
  }
}

export class BusCurrentUsageFormControl extends FormControl {
  // set validators to required
  constructor() {
    super(0, [
      Validators.required,
      Validators.min(0)
    ]);
  }
}

export class BusCurrentRouteFormControl extends FormControl {
  // set validators to required
  constructor(options: Route[]) {
    super('', [
      Validators.required,
      optionsValidator(options)
    ]);
  }
}
