import {UserSimple} from './user-simple';

export interface SaveCongeRequest {
  id?: number;
  startDate: string;
  endDate: string;
  requesterId: number;
  validatorId: number;
  reason: string;
}

export interface CongeRequest {
  id: number;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  startDate: string;
  endDate: string;
  requester: UserSimple;
  validator: UserSimple;
  reason: string;
}
