import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crear-cuestionario',
  imports: [],
  templateUrl: './crear-cuestionario.html',
  styleUrl: './crear-cuestionario.css'
})
export class CrearCuestionario {
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
