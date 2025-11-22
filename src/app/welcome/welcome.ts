import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css'
})
export class Welcome implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Redirigir automáticamente después de 2 segundos
    setTimeout(() => {
      this.router.navigate(['/crear-cuestionario']);
    }, 2000);
  }
}
