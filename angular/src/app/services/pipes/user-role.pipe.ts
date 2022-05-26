import { Pipe, PipeTransform } from '@angular/core';

import { UserRole } from 'src/app/models/user.model';

@Pipe({
  name: 'userrole'
})
export class UserRolePipe implements PipeTransform {

  transform(value: number): string {
    return UserRole[value] || '-';
  }
}
