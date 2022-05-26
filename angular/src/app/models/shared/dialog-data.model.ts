import { ComplexBusDto } from '../bus.model';
import { Route } from '../route.model';
import { Station } from '../station.model';
import { User } from '../user.model';
import { Zone } from '../zone.model';

export interface DialogData {
  title: string;
  question: string;
}

export interface BusQrDialogData {
  numberPlate: string;
}

export interface UpdateBusDialogData {
  bus: ComplexBusDto;
}

export interface CreateOrUpdateRouteDialogData {
  stations: Station[];
  route?: Route;
}

export interface CreateOrUpdateStationDialogData {
  zones: Zone[];
  station?: Station;
}

export interface UpdateUserDialogData {
  user: User;
}

export interface UpdateZoneDialogData {
  zone: Zone;
}
