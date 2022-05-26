import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'idstonames'
})
export class IdsToNamesPipe implements PipeTransform {

  transform(ids: string[], objs: any[]): string[] {
    return ids.map(id => objs.find(obj => obj.id === id)?.name);
  }
}
