import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAdviserComponent } from './add-adviser.component';

describe('AddAdviserComponent', () => {
  let component: AddAdviserComponent;
  let fixture: ComponentFixture<AddAdviserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAdviserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAdviserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
