import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

import { CanDeactivateComponent } from 'src/app/models/shared/can-deactivate-component.model';

@Injectable({
  providedIn: 'root'
})
export class DeactivateGuardService implements CanDeactivate<CanDeactivateComponent> {

  canDeactivate(component: CanDeactivateComponent): Observable<boolean> | boolean {
    // return if component can be deactivated
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
