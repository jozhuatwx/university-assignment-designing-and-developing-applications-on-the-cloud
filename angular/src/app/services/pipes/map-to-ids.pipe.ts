import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maptoids'
})
export class MapToIdsPipe implements PipeTransform {

  transform(objs: any[]): string[] {
    return objs.map(obj => obj.id);
  }
}
