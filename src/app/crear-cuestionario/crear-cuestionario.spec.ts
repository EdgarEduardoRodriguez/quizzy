import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCuestionario } from './crear-cuestionario';

describe('CrearCuestionario', () => {
  let component: CrearCuestionario;
  let fixture: ComponentFixture<CrearCuestionario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCuestionario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearCuestionario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
