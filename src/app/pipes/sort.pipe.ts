import { Pipe, PipeTransform } from '@angular/core';
import { Calificaciones } from '../models/calificaciones.model';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(value: Array<Calificaciones>, args: string): Array<Calificaciones> {
    return value.sort((a: Calificaciones, b: Calificaciones) => {
      if (a.total > b.total) {
        return -1;
      } else if (a.total < b.total) {
        return 1;
      } else {
        return 0;
      }
    });
  }

}
