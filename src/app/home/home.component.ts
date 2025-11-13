import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class Home {
  constructor(private router: Router) {}

  onComenzarAhora() {
    // Navegar a la página de crear cuestionario
    this.router.navigate(['/crear-cuestionario']);
  }
}
