import { ContextEntity } from './shared/context-entity.model';

export interface Zone extends ContextEntity {
  name: string;
  locationValue: number;
  hasStations?: boolean;
}

export function isZone(obj: any): obj is Zone {
  return obj != undefined && obj.id != undefined && obj.name != undefined && obj.locationValue != undefined;
}

export interface CreateOrUpdateZoneDto {
  name: string;
  locationValue: number;
}
