import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceNotificationComponent } from './absence-notification.component';

describe('AbsenceNotificationComponent', () => {
  let component: AbsenceNotificationComponent;
  let fixture: ComponentFixture<AbsenceNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbsenceNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbsenceNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
