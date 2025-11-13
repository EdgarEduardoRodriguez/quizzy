import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
export class App {
  protected readonly title = signal('ejemplo');
}
