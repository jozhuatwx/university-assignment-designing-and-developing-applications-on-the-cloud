import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'join'
})
export class JoinPipe implements PipeTransform {

  transform(objs: string[], separator: string): string {
    return objs.join(separator) || '-';
  }
}
