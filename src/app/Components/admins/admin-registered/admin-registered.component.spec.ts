import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRegisteredComponent } from './admin-registered.component';

describe('AdminRegisteredComponent', () => {
  let component: AdminRegisteredComponent;
  let fixture: ComponentFixture<AdminRegisteredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminRegisteredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRegisteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
