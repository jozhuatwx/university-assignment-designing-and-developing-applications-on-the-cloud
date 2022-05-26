import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'split'
})
export class SplitPipe implements PipeTransform {

  transform(obj: string, separator: string): string[] {
    return obj.split(separator);
  }
}
