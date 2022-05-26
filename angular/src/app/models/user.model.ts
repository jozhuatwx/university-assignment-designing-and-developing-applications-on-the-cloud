import { ContextEntity } from './shared/context-entity.model';

export enum UserRole {
  unregistered = -1,
  customer = 0,
  driver = 1,
  admin = 2
}

export interface User extends ContextEntity {
  name: string;
  email: string;
  profilePictureFileUrl?: string;
  role: UserRole;
}

export class User implements User {
  constructor() {
    this.id = '00000000-0000-0000-0000-000000000000';
    this.name = '';
    this.email = '';
    this.role = UserRole.unregistered;
  }

  static roles = [
    { key: 0, value: 'Customer' },
    { key: 1, value: 'Driver' },
    { key: 2, value: 'Admin' }
  ];
}

export function isUser(obj: any): obj is User {
  return obj != undefined && obj.id != undefined && obj.email != undefined && obj.name != undefined && obj.role != undefined;
}

export function isUsers(objs: any[]): objs is User[] {
  return objs != undefined && objs.every(obj => isUser(obj));
}

export interface NameOnlyUserDto {
  id: string;
  name: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface RegisterUserDto {
  name: string;
  email: string;
  profilePictureFileBase64?: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name: string;
  email: string;
  profilePictureFileBase64?: string;
  removeProfilePicture?: boolean;
  updatePassword?: boolean;
  password?: string;
  newPassword?: string;
  role?: UserRole;
}
