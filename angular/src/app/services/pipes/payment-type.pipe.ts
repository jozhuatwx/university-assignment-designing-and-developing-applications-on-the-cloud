import { Pipe, PipeTransform } from '@angular/core';

import { PaymentType } from 'src/app/models/payment.model';

@Pipe({
  name: 'paymenttype'
})
export class PaymentTypePipe implements PipeTransform {

  transform(value: number): string {
    return PaymentType[value] || '-';
  }
}
