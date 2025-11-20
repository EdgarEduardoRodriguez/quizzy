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

  // mapeo de tipos de pregunta con sus iconos y nombres
  questionTypeConfig: { [key: string]: { icon: string, name: string} } = {
    'multiple': { icon: 'checklist', name: 'Opción múltiple' },
    'abierta': { icon: 'chat_bubble_outline', name: 'Pregunta abierta' },
    'cuestionario': { icon: 'assignment', name: 'Cuestionario' }
  };

  //propiedad computada para obtener la configutracion del tipo actual
  get currentQuestionTypeConfig() {
    return this.questionTypeConfig[this.selectedQuestionType] || this.questionTypeConfig['multiple'];
  }

  // propiedad para mostrar/ocultar el dropdown personalizado
  showDropdown: boolean = false;

  // para sidebar derecho de configuracion de pregunta
  showConfigSidebar: boolean = false;

  //propiedad para controlar si se permiten varias opciones seleccionadas
  allowMultipleOptions: boolean = false;

  //propiedad para el numero maximo de opciones seleccionables
  maxSelectableOptions: number = 2;

  // propiedad para mostrar/ocultar la respuesta correcta
  showCorrectAnswer: boolean = false;

  //propiedad para mostrar/ocultar la descripcion de la pregunta
  showQuestionDescription: boolean = false;

  //propuedad para el texto de la descripcion
  questionDescription: string ='';

  // getter para verificar si hay al menos una respuesta correcta marcada
  get hasCorrectAnswers(): boolean {
    return this.options.some(option => option.isCorrect);
  }

  toggleConfigSidebar() {
    console.log('toggleConfigSidebar called, current state:', this.showConfigSidebar);
    this.showConfigSidebar = !this.showConfigSidebar;
    console.log('New state:', this.showConfigSidebar);
  }

  // metodo para alternar la opcion de varias opciones
  toggleMultipleOptions() {
    this.allowMultipleOptions = !this.allowMultipleOptions;
    console.log('Varias opciones:', this.allowMultipleOptions ? 'activado' : 'desactivado');
  }

  // metodo para alternar la opcion de mostrar respuesta correcta
  toggleCorrectAnswer() {
    this.showCorrectAnswer = !this.showCorrectAnswer;
    console.log('Mostrar respuesta correcta:', this.showCorrectAnswer ? 'activado' : 'desactivado');
  }

  //metodo para alternar la opcion de mostrar la descripcion de la pregunta
  toggleQuestionDescription() {
    this.showQuestionDescription = !this.showQuestionDescription;
    console.log('Mostrar descripcion de la pregunta:', this.showQuestionDescription ? 'activado' : 'desactivado');
  }

  // metodo para aumentar el numero maximo de opciones
  increaseMaxOptions() {
    if (this.maxSelectableOptions < this.options.length) {
      this.maxSelectableOptions++;
    }
  }

  // metodo para disminuir el numero maximo de opciones
  decreaseMaxOptions() {
    if (this.maxSelectableOptions > 1) {
      this.maxSelectableOptions--;
    }
  }

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
  options: { text: string, isCorrect: boolean }[] = [
    { text: '', isCorrect: false},
    { text: '', isCorrect: false},
    { text: '', isCorrect: false},
    { text: '', isCorrect: false}
  ];

  // metodo para agregar opcion
  addOption() {
    this.options.push({ text: '', isCorrect: false });
  }

  // metodo para eleminar opcion
  removeOption(index: number) {
    if (this.options.length > 2) { // minimo 2 opciones
      this.options.splice(index, 1);
    }
  }

  // metodo para alternar si una opcion es correcta
  toggleCorrectOption(index: number) {
    if (this.showCorrectAnswer) {
        this.options[index].isCorrect = !this.options[index].isCorrect;
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
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
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
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ];

    console.log('Tipo de pregunta cambiado a:', this.selectedQuestionType);
  }

  // metodo para eliminar la pregunta actual
  deleteQuestion() {
    if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      // Reset all form data
      this.questionText = '';
      this.options = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ];
      this.selectedQuestionType = 'multiple';
      this.showDropdown = false;

      // Go back to options view
      this.currentView = 'options';

      console.log('Pregunta eliminada');
    }
  }

}
