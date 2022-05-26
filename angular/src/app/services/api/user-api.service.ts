import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { LoginUserDto, NameOnlyUserDto, RegisterUserDto, UpdateUserDto, User, UserRole } from 'src/app/models/user.model';
import { DialogComponent } from 'src/app/components/dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class UserApiService {

  // api url
  private readonly api = `${environment.apiUrl}/Users`;

  // user details
  private user = new User();

  // subject to update user name
  userChange = new BehaviorSubject<User>(this.user);

  // state
  private authenticated = false;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private dialog: MatDialog
  ) {
    // read user from local or session storage
    const user = localStorage.getItem('bmu-user') ? localStorage.getItem('bmu-user') : sessionStorage.getItem('bmu-user');
    if (user) {
      // set user details
      this.user = <User>JSON.parse(user);
      // update state
      this.authenticated = true;
      // set user to update menu
      this.userChange.next(this.user);
    }
  }

  isAuthenticated(): boolean {
    // return authenticated state
    return this.authenticated;
  }

  isAdmin(): boolean {
    // return whether user is admin
    return this.user.role === UserRole.admin;
  }

  isDriver(): boolean {
    // return whether user is driver
    return this.user.role === UserRole.driver;
  }

  isCustomer(): boolean {
    // return whether user is customer
    return this.user.role === UserRole.customer;
  }

  getCurrentUser(): User {
    // return user details
    return this.user;
  }

  setCurrentUser(user: User): void {
    // update user name
    this.user = user;
    this.userChange.next(user);

    if (localStorage.getItem('bmu-user')) {
      // save to user details local storage
      localStorage.setItem('bmu-user', JSON.stringify(this.user));
    } else {
      // save to user details session storage
      sessionStorage.setItem('bmu-user', JSON.stringify(this.user));
    }
  }

  register(data: RegisterUserDto, stayLoggedIn?: boolean): Observable<User> {
    // create user
    return this.httpClient.post<User>(`${this.api}/Register`, data, { headers: { 'user-id': this.getCurrentUser().id } })
      .pipe(
        map((response) => {
          if (!this.isAdmin()) {
            // set user details
            this.user = response;
            // set user to update menu 
            this.userChange.next(this.user);
            // update state
            this.authenticated = true;
            if (stayLoggedIn) {
              // save to user details local storage
              localStorage.setItem('bmu-user', JSON.stringify(this.user));
            } else {
              // save to user details temporary session storage
              sessionStorage.setItem('bmu-user', JSON.stringify(this.user));
            }
          }
          return response;
        })
      );
  }

  login(data: LoginUserDto, stayLoggedIn: boolean): Observable<UserRole> {
    // get user details
    return this.httpClient.post<User>(`${this.api}/Login`, data, { headers: { 'user-id': this.getCurrentUser().id } })
      .pipe(
        map((response) => {
          // set user details
          this.user = response;
          // set user to update menu 
          this.userChange.next(this.user);
          // update state
          this.authenticated = true;
          if (stayLoggedIn) {
            // save to user details local storage
            localStorage.setItem('bmu-user', JSON.stringify(this.user));
          } else {
            // save to user details temporary session storage
            sessionStorage.setItem('bmu-user', JSON.stringify(this.user));
          }
          return response.role;
        })
      );
  }

  getAll(namesOnly?: boolean, includeDeleted?: boolean): Observable<User[] | NameOnlyUserDto[]> {
    // check if request user is admin
    if (this.user.role === UserRole.admin) {
      let params = new HttpParams();
      if (namesOnly) {
        params = params.append('NamesOnly', namesOnly);
      }
      if (includeDeleted) {
        params = params.append('IncludeDeleted', includeDeleted);
      }
      // get users
      return this.httpClient.get<User[]>(`${this.api}`, { params: params, headers: { 'user-id': this.getCurrentUser().id } });
    }
    return throwError("Only admin can view users");
  }

  get(email: string): Observable<User> {
    // check if request user is admin
    if (this.user.role === UserRole.admin) {
      // get users
      return this.httpClient.get<User>(`${this.api}/${email}`, { headers: { 'user-id': this.getCurrentUser().id } });
    }
    return throwError("Only admin can view users");
  }

  update(data: UpdateUserDto, id?: string, profilePictureType?: string): Observable<string> {
    // check if requested user is admin
    if (id && this.user.id !== id && this.user.role === UserRole.admin) {
      // update user details
      return this.httpClient.put<string>(`${this.api}/${id}`, data, { headers: { 'user-id': this.getCurrentUser().id } });
    } else {
      // update user details
      return this.httpClient.put<string>(this.api, data, { headers: { 'user-id': this.getCurrentUser().id } })
        .pipe(
          map((response) => {
            let profilePictureFileUrl: string | undefined;
            if (!data.removeProfilePicture && profilePictureType && data.profilePictureFileBase64) {
              profilePictureFileUrl = `${profilePictureType}base64,${data.profilePictureFileBase64}`;
            }
            this.setCurrentUser({
              id: this.user.id,
              name: data.name,
              email: data.email,
              profilePictureFileUrl: profilePictureFileUrl,
              role: data.role ? data.role : this.user.role
            });
            return response;
          })
        );
    }
  }

  delete(id?: string): Observable<string> {
    // check if requested user is the same with deleted user
    if (id && this.user.id !== id) {
      // delete user
      return this.httpClient.delete<string>(`${this.api}/${id}`, { headers: { 'user-id': this.getCurrentUser().id } });
    } else {
      // delete user
      return this.httpClient.delete<string>(this.api, { headers: { 'user-id': this.getCurrentUser().id } })
        .pipe(
          map((response) => {
            // logout
            if (response) {
              this.logout();
            }
            return response;
          })
        );
    }
  }

  confirmLogout(): void {
    // open a dialog to warn logging out
    this.dialog.open(DialogComponent, {
      data: {
        title: 'Logout',
        question: 'Changes made without saving will be lost. Do you confirm?'
      }
    }).afterClosed()
        .subscribe({
          next: (confirm) => {
            // logout when confirmed
            if (confirm) {
              this.logout();
            }
          }
        });
  }

  private logout(): void {
    // clear user details
    this.user = new User();
    this.userChange.next(this.user);
    // update state
    this.authenticated = false;
    // clear storage
    localStorage.removeItem('bmu-user');
    sessionStorage.removeItem('bmu-user');
    // redirect to home page
    this.router.navigate(['/home']);
  }
}
