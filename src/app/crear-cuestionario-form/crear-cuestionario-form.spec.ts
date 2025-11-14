import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCuestionarioForm } from './crear-cuestionario-form';

describe('CrearCuestionarioForm', () => {
  let component: CrearCuestionarioForm;
  let fixture: ComponentFixture<CrearCuestionarioForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCuestionarioForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearCuestionarioForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
