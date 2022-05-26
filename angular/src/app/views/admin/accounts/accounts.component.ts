import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { RegisterUserDialogComponent } from 'src/app/components/user-accounts/register-user-dialog/register-user-dialog.component';
import { UpdateUserDialogComponent } from 'src/app/components/user-accounts/update-user-dialog/update-user-dialog.component';
import { User, isUser, isUsers } from 'src/app/models/user.model';
import { UserApiService } from 'src/app/services/api/user-api.service';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html'
})
export class AccountsComponent implements OnInit, OnDestroy {

  // get reference to html element
  @ViewChild(MatSort) sort: MatSort | undefined;

  // accounts data
  accounts: User[] = [];

  // table options
  displayedColumns = ['id', 'name', 'email', 'role', 'actions'];
  tableDataSource = new MatTableDataSource<User>();

  // states
  loading = false;

  // subscriptions to unsubscribe
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private userApiService: UserApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loading = true;
    // add to subscriptions
    this.subscriptions.push(
      this.userApiService.getAll()
        .subscribe({
          next: (users) => {
            // get users
            if (isUsers(users)) {
              this.accounts = users;
            }
            // generate table data source
            this.generateDataSource();
            this.loading = false;
          },
          error: (error: HttpErrorResponse) => {
            // show error message
            this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
            this.loading = false;
          }
        })
    )
  }

  add(): void {
    // add to subscriptions
    this.subscriptions.push(
      this.dialog.open(RegisterUserDialogComponent)
        .afterClosed()
        .subscribe({
          next: (createdUser: User) => {
            if (createdUser) {
              this.accounts.unshift(createdUser);
              this.generateDataSource();
            }
          }
        })
    );
  }

  edit(user: User): void {
    // add to subscriptions
    this.subscriptions.push(
      this.dialog.open(UpdateUserDialogComponent, {
        data: { user: user }
      }).afterClosed()
        .subscribe({
          next: (updatedUser: User) => {
            if (updatedUser && isUser(updatedUser)) {
              this.accounts[this.accounts.findIndex(data => data.id === user.id)] = updatedUser;
              this.generateDataSource();
            }
          }
        })
    );
  }

  delete(id: string): void {
    // add to subscriptions
    this.subscriptions.push(
      // open a dialog to warn deleting account
      this.dialog.open(DialogComponent, {
        data: {
          title: 'Warning',
          question: 'Deleting account. Are you sure?'
        }
      }).afterClosed()
        .subscribe({
          next: (confirm) => {
            if (confirm) {
              // add to subscriptions
              this.subscriptions.push(
                // delete user when confirmed
                this.userApiService.delete(id)
                  .subscribe({
                    next: (status) => {
                      // show message
                      this.snackBar.open(status, 'OK');
                      // check if requested user is the same with deleted user
                      if (this.userApiService.getCurrentUser().id === id) {
                        // redirect to home page
                        this.router.navigate(['/home']);
                      } else {
                        this.accounts = this.accounts.filter(data => data.id !== id);
                        this.generateDataSource();
                      }
                    },
                    error: (error: HttpErrorResponse) => {
                      // show error message
                      this.snackBar.open(`Error: ${typeof error.error === 'string' ? error.error : error.message}`, 'OK');
                    }
                  })
              )
            }
          }
        })
    );
  }

  private generateDataSource(): void {
    // update table data
    this.tableDataSource = new MatTableDataSource(this.accounts);
    if (this.sort) {
      this.tableDataSource.sort = this.sort;
    }
  }

  ngOnDestroy(): void {
    // unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
