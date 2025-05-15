import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolunteerWaitingComponent } from './volunteer-waiting.component';

describe('VolunteerWaitingComponent', () => {
  let component: VolunteerWaitingComponent;
  let fixture: ComponentFixture<VolunteerWaitingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolunteerWaitingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolunteerWaitingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
