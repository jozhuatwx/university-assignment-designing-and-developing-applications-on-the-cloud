import { TableEntity } from './shared/table-entity.model';

export interface Location extends TableEntity {
  busId: string;
  stationId: string;
}
