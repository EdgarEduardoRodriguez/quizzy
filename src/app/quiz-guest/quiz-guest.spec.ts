import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizGuest } from './quiz-guest';

describe('QuizGuest', () => {
  let component: QuizGuest;
  let fixture: ComponentFixture<QuizGuest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizGuest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizGuest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
