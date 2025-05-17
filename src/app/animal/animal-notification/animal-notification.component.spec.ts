import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalNotificationComponent } from './animal-notification.component';

describe('AnimalNotificationComponent', () => {
  let component: AnimalNotificationComponent;
  let fixture: ComponentFixture<AnimalNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
