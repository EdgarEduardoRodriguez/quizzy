import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { PrimerComponent } from './miPrimerComponente/primer.component';
import { Encabezado } from "./navbar/encabezado.component";
import { CommonModule } from '@angular/common';
import { Home } from "./home/home.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PrimerComponent, Encabezado, CommonModule, Home],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('ejemplo');
  showHeader = signal(true);

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.showHeader.set(!this.router.url.includes('/quiz-guest'));
    });
  }
}
