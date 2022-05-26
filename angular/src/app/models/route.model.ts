import { ContextEntity } from './shared/context-entity.model';
import { Station } from './station.model';

export interface Route extends ContextEntity {
  name: string;
  stations: Station[];
  hasBuses?: boolean;
}

export function isRoute(obj: any): obj is Route {
  return obj != undefined && obj.id != undefined && obj.name != undefined && obj.stations != undefined;
}

export function isRoutes(objs: any[]): objs is Route[] {
  return objs != undefined && objs.every(obj => isRoute(obj));
}

export interface NameOnlyRouteDto {
  id: string;
  name: string;
}

export interface CreateOrUpdateRouteDto {
  name: string;
  stationIds: string[];
}
