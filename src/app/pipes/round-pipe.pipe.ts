import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundPipe'
})
export class RoundPipePipe implements PipeTransform {

  transform(value: number): number {
    if (Math.round(value) < value) {
      return Math.round(value) + 1;
    }
    return Math.round(value);
  }

}
