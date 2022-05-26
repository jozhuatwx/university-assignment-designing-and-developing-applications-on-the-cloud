import { ContextEntity } from './shared/context-entity.model';

export interface Station extends ContextEntity {
  name: string;
  zoneId: string;
  hasRoutes?: boolean;
}

export function isStation(obj: any): obj is Station {
  return obj != undefined && obj.id != undefined && obj.name != undefined && obj.zoneId;
}

export function isStations(objs: any[]): objs is Station[] {
  return objs != undefined && objs.every(obj => isStation(obj));
}

export interface NameOnlyStationDto {
  id: string;
  name: string;
}

export interface CreateOrUpdateStationDto {
  name: string;
  zoneId: string;
}
