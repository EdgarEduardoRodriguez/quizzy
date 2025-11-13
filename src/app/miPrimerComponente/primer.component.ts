import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-primerComponente',
  templateUrl: './primer.component.html',
  styleUrl: './primer.component.css'
})
export class PrimerComponent {
  title = 'ejemplo';
}
