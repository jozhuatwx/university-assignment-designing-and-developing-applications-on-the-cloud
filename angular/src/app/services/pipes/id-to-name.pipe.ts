import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'idtoname'
})
export class IdToNamePipe implements PipeTransform {

  transform(id?: string, objs?: any[]): string {
    return objs?.find(obj => obj.id === id)?.name || '-';
  }
}
