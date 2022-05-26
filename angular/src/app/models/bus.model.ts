import { ContextEntity } from './shared/context-entity.model';

export interface Bus extends ContextEntity {
  numberPlate: string;
  capacity: number;
  currentUsage: number;
  currentRouteId?: string;
}

export function isBus(obj: any): obj is Bus {
  return obj != undefined && obj.id != undefined && obj.numberPlate != undefined && obj.capacity != undefined && obj.currentUsage != undefined;
}

export function isBuses(objs: any[]): objs is Bus[] {
  return objs != undefined && objs.every(obj => isBus(obj));
}

export interface ComplexBusDto extends Bus {
  stationName?: string;
  disinfectionTime?: number;
  timestamp?: number;
}

export interface NumberPlateOnlyBusDto {
  numberPlate: string;
}

export function isComplexBuses(objs: any[]): objs is ComplexBusDto[] {
  return objs != undefined && objs.every(obj => isBus(obj));
}

export function complexBusToBus(complexBus: ComplexBusDto): Bus {
  return {
    id: complexBus.id,
    numberPlate: complexBus.numberPlate,
    capacity: complexBus.capacity,
    currentUsage: complexBus.currentUsage,
    currentRouteId: complexBus.currentRouteId
  }
}
export interface CreateOrUpdateBusDto {
  numberPlate: string;
  capacity: number;
}

export interface UpdateDriverBusDto {
  currentUsage?: number;
  currentRouteId?: string;
  stopRoute?: boolean;
  stationId?: string;
  disinfected?: boolean;
}
