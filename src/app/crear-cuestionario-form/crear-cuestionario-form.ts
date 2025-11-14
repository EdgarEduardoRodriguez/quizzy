import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-cuestionario-form',
  imports: [],
  templateUrl: './crear-cuestionario-form.html',
  styleUrl: './crear-cuestionario-form.css'
})
export class CrearCuestionarioForm {
  constructor(private router: Router) {}

  // propiedad para controlar si el sidebar esta colapsado
  isSidebarCollapsed: boolean = false;

  volverHome() {
    this.router.navigate(['/home']);
  }

  // metodo para alternar el estado del sidebar
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

}
