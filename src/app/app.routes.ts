import { Routes } from '@angular/router';
import { Home } from './home/home.component';
import { CrearCuestionario } from './crear-cuestionario/crear-cuestionario';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'crear-cuestionario', component: CrearCuestionario }
];
