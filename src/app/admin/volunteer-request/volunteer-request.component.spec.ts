import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolunteerRequestComponent } from './volunteer-request.component';

describe('VolunteerRequestComponent', () => {
  let component: VolunteerRequestComponent;
  let fixture: ComponentFixture<VolunteerRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolunteerRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolunteerRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
