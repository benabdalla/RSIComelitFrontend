import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class CongeRequestEventsService {
  private refreshRequests: BehaviorSubject<number> = new BehaviorSubject(0);

  triggerRefresh() {
    this.refreshRequests.next(this.refreshRequests.getValue() + 1);
  }

  getAsObservable() {
    return this.refreshRequests.asObservable();
  }
}
