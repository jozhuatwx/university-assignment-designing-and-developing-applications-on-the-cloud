import { TableEntity } from './shared/table-entity.model';

export enum PaymentType {
  travel = 0,
  topUp = 1
}

export interface Payment extends TableEntity {
  userId: string;
  amount: number;
  type: PaymentType;
  startingStationId?: string;
  endingStationId?: string;
}

export function isPayment(obj: any): obj is Payment {
  return obj != undefined && obj.id != undefined && obj.modifiedTime != undefined && obj.userId != undefined && obj.amount != undefined && obj.type != undefined;
}

export interface BalanceWithPaymentDto {
  balance: number;
  payments: Payment[];
}

export interface CreateTopUpPaymentDto {
  amount: number;
}

export interface CreateOrUpdateTravelPaymentDto {
  numberPlate: string;
}
