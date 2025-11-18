import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear-cuestionario-form',
  imports: [CommonModule],
  templateUrl: './crear-cuestionario-form.html',
  styleUrl: './crear-cuestionario-form.css'
})
export class CrearCuestionarioForm {
  constructor(private router: Router) {}

  // propiedad para controlar si el sidebar esta colapsado
  isSidebarCollapsed: boolean = false;

  // propiedad para animar las tarjetas de opciones
  animateCards: boolean = false;

  volverHome() {
    this.router.navigate(['/home']);
  }

  // metodo para alternar el estado del sidebar
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onMisInteracciones() {
    
  }

  onAgregarPregunta() {
    this.animateCards = true;
  }

  seleccionarTipo(tipo: string) {
    alert(`Seleccionaste: ${tipo}`);
  }
}
