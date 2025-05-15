import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolunteerSearchComponent } from './volunteer-search.component';

describe('VolunteerSearchComponent', () => {
  let component: VolunteerSearchComponent;
  let fixture: ComponentFixture<VolunteerSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VolunteerSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VolunteerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
