import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { Payment, PaymentType } from 'src/app/models/payment.model';
import { User } from 'src/app/models/user.model';
import { PaymentApiService } from 'src/app/services/api/payment-api.service';
import { UserApiService } from 'src/app/services/api/user-api.service';
import { PaymentCardCvvFormControl, PaymentCardNumberFormControl, PaymentTopUpAmountFormControl } from 'src/app/services/form-controls/payment.form-control';
import { UserEmailFormControl, UserNameFormControl } from 'src/app/services/form-controls/user.form-control';

@Component({
  selector: 'app-top-up-form',
  templateUrl: './top-up-form.component.html'
})
export class TopUpFormComponent implements OnDestroy {

  @Output() paymentChange = new EventEmitter<Payment>();

  user: User | undefined;

  // form group to top up and enter card details
  userForm = new FormGroup({
    email: new UserEmailFormControl()
  });
  topUpForm = new FormGroup({
    amount: new PaymentTopUpAmountFormControl()
  });
  cardForm = new FormGroup({
    name: new UserNameFormControl(),
    number: new PaymentCardNumberFormControl(),
    cvv: new PaymentCardCvvFormControl(),
    expiryDate: new FormControl('', [ Validators.required ])
  });
  minExpiryDate = new Date();
  maxExpiryDate = new Date().setFullYear(this.minExpiryDate.getFullYear() + 5);
  matcher = new ErrorStateMatcher();

  // subscriptions to unsubcribe
  private subscriptions: Subscription[] = [];

  constructor(
    private paymentApiService: PaymentApiService,
    public userApiService: UserApiService,
    private snackBar: MatSnackBar
  ) { }

  loadUser(): void {
    if (this.userForm.valid) {
      this.subscriptions.push(
        this.userApiService.get(this.userForm.get('email')?.value)
          .subscribe({
            next: (user) => {
              this.user = user;
            },
            error: (error: HttpErrorResponse) => {
              // show error message
              this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
            }
          })
      )
    }
  }

  topUp(): void {
    if (this.topUpForm.valid) {
      this.subscriptions.push(
        this.paymentApiService.topUp({ amount: this.topUpForm.get('amount')?.value }, this.user?.id)
          .subscribe({
            next: (payment) => {
              // show message
              this.snackBar.open('Top up successful', 'OK');
              // emit created
              this.paymentChange.emit(payment);
            },
            error: (error: HttpErrorResponse) => {
              // show error message
              this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
            }
          })
      );
    }
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
