import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-cuestionario-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-cuestionario-form.html',
  styleUrl: './crear-cuestionario-form.css'
})
export class CrearCuestionarioForm {
  constructor(private router: Router) {}

  // propiedad para controlar si el sidebar esta colapsado
  isSidebarCollapsed: boolean = false;

  // propiedad para animar las tarjetas de opciones
  animateCards: boolean = false;

  // propiedad para controlar la vista actual
  currentView: 'options' | 'form' = 'options';

  // propiedad para el tipo de pregunta seleccionado en el dropdown
  selectedQuestionType: string = 'multiple';

  // propiedad para mostrar/ocultar el dropdown personalizado
  showDropdown: boolean = false;

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
    this.currentView = 'form';
    this.animateCards = true;
  }

  seleccionarTipo(tipo: string) {
    if (tipo === 'multiple') {
      this.currentView = 'form';
    } else {
      alert(`Seleccionaste: ${tipo}`);
    }
  }

  // propiedades para el formualrio de opcion multilpe
  questionText: string = '';
  options: { text: string }[] = [
    { text: ''},
    { text: ''},
    { text: ''},
    { text: ''}
  ];

  // metodo para agregar opcion
  addOption() {
    this.options.push({ text: ''});
  }

  // metodo para eleminar opcion
  removeOption(index: number) {
    if (this.options.length > 2) { // minimo 2 opciones
      this.options.splice(index, 1);
    }
  }

  // metodo auxiliar para trackBy en ngfor
  trackByIndex(index: number): number {
    return index;
  }

  // metodo para mostrar/ocultar el dropdown personalizado
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  // metodo para seleccionar un tipo de pregunta desde el dropdown personalizado
  selectQuestionType(type: string) {
    this.selectedQuestionType = type;
    this.showDropdown = false; // cerrar el dropdown

    // Reset form data when changing type
    this.questionText = '';
    this.options = [
      { text: ''},
      { text: ''},
      { text: ''},
      { text: ''}
    ];

    console.log('Tipo de pregunta cambiado a:', this.selectedQuestionType);
  }

  // metodo para cambiar el tipo de pregunta desde el select HTML
  changeQuestionType(event: any) {
    const newType = event.target.value;
    this.selectedQuestionType = newType;

    // Reset form data when changing type
    this.questionText = '';
    this.options = [
      { text: ''},
      { text: ''},
      { text: ''},
      { text: ''}
    ];

    console.log('Tipo de pregunta cambiado a:', this.selectedQuestionType);
  }

}
