import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceListComponentComponent } from './absence-list-component.component';

describe('AbsenceListComponentComponent', () => {
  let component: AbsenceListComponentComponent;
  let fixture: ComponentFixture<AbsenceListComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbsenceListComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbsenceListComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
