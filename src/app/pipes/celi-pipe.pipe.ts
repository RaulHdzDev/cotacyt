import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'celiPipe'
})
export class CeliPipePipe implements PipeTransform {

  transform(value: number): number {
    return Math.ceil(value);
  }

}
