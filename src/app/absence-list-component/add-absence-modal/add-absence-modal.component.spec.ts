import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAbsenceModalComponent } from './add-absence-modal.component';

describe('AddAbsenceModalComponent', () => {
  let component: AddAbsenceModalComponent;
  let fixture: ComponentFixture<AddAbsenceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAbsenceModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAbsenceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
