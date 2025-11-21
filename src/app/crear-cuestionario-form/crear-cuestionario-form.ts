import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionnaireService } from '../services/questionnaire.service';

@Component({
  selector: 'app-crear-cuestionario-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-cuestionario-form.html',
  styleUrl: './crear-cuestionario-form.css'
})
export class CrearCuestionarioForm implements OnInit {
  constructor(private router: Router, private questionnaireService: QuestionnaireService) {}

  // Propiedad para almacenar los cuestionarios
  questionnaires: any[] = [];

  // Propiedades para edición
  isEditing: boolean = false;
  editingQuestionnaireId: number | null = null;

  ngOnInit() {
    this.loadQuestionnaires();
  }

  // Detectar clicks fuera del menú para cerrarlo
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Cerrar todos los menús si se hace click fuera
    this.questionnaires.forEach(q => {
      q.showMenu = false;
    });
  }

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
    this.currentView = 'options';
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

  // Método para cargar cuestionarios
  loadQuestionnaires() {
    this.questionnaireService.getQuestionnaires().subscribe({
      next: (data) => {
        this.questionnaires = data;
      },
      error: (error) => {
        console.error('Error loading questionnaires:', error);
      }
    });
  }

  // Método para guardar cuestionario
  saveQuestionnaire() {
    if (!this.questionText.trim()) {
      alert('Por favor ingresa el texto de la pregunta');
      return;
    }

    // Filtrar opciones que tienen texto y mapear isCorrect a is_correct
    const validOptions = this.options
      .filter(opt => opt.text.trim())
      .map(opt => ({
        text: opt.text,
        is_correct: opt.isCorrect
      }));

    if (validOptions.length < 2) {
      alert('Por favor agrega al menos 2 opciones');
      return;
    }

    const questionnaireData = {
      title: this.questionText, // Usar el texto de la pregunta como título del cuestionario
      description: this.questionDescription,
      questions: [{
        text: this.questionText,
        description: this.questionDescription,
        type: this.selectedQuestionType,
        allow_multiple: this.allowMultipleOptions,
        max_options: this.maxSelectableOptions,
        options: validOptions
      }]
    };

    console.log('Enviando datos del cuestionario:', questionnaireData);

    if (this.isEditing && this.editingQuestionnaireId) {
      // Si estamos editando, eliminar el cuestionario anterior y crear uno nuevo
      this.questionnaireService.deleteQuestionnaire(this.editingQuestionnaireId).subscribe({
        next: () => {
          // Después de eliminar, crear el nuevo
          this.createNewQuestionnaire(questionnaireData);
        },
        error: (error) => {
          console.error('Error deleting old questionnaire:', error);
          alert('Error al actualizar el cuestionario');
        }
      });
    } else {
      // Crear nuevo cuestionario
      this.createNewQuestionnaire(questionnaireData);
    }
  }

  // Método auxiliar para crear un nuevo cuestionario
  createNewQuestionnaire(questionnaireData: any) {
    this.questionnaireService.createQuestionnaire(questionnaireData).subscribe({
      next: (response) => {
        const message = this.isEditing ? 'Cuestionario actualizado exitosamente' : 'Cuestionario guardado exitosamente';
        alert(message);
        this.loadQuestionnaires(); // Recargar la lista
        this.resetForm();
        this.isEditing = false;
        this.editingQuestionnaireId = null;
      },
      error: (error) => {
        console.error('Error saving questionnaire:', error);
        alert('Error al guardar el cuestionario');
      }
    });
  }

  // Método para resetear el formulario
  resetForm() {
    this.questionText = '';
    this.questionDescription = '';
    this.options = [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ];
    this.currentView = 'options';
  }

  // Método para mostrar/ocultar el menú de opciones
  toggleMenu(event: Event, questionnaire: any) {
    event.stopPropagation(); // Evitar que se propague el click

    // Cerrar otros menús abiertos
    this.questionnaires.forEach(q => {
      if (q !== questionnaire) {
        q.showMenu = false;
      }
    });

    // Toggle el menú del cuestionario actual
    questionnaire.showMenu = !questionnaire.showMenu;
  }

  // Método para duplicar un cuestionario
  duplicateQuestionnaire(questionnaire: any) {
    // Cerrar el menú
    questionnaire.showMenu = false;

    // Cargar los datos del cuestionario para duplicar
    this.questionnaireService.getQuestionnaire(questionnaire.id).subscribe({
      next: (data) => {
        // Crear una copia con título modificado
        const duplicatedData = {
          ...data,
          title: `${data.title} (Copia)`
        };

        // Crear el cuestionario duplicado
        this.questionnaireService.createQuestionnaire(duplicatedData).subscribe({
          next: (response) => {
            alert('Cuestionario duplicado exitosamente');
            this.loadQuestionnaires(); // Recargar la lista
          },
          error: (error) => {
            console.error('Error duplicating questionnaire:', error);
            alert('Error al duplicar el cuestionario');
          }
        });
      },
      error: (error) => {
        console.error('Error loading questionnaire for duplication:', error);
        alert('Error al cargar el cuestionario para duplicar');
      }
    });
  }

  // Método para poblar el formulario con datos de un cuestionario existente
  populateFormWithQuestionnaire(questionnaire: any) {
    if (questionnaire.questions && questionnaire.questions.length > 0) {
      const question = questionnaire.questions[0]; // Tomar la primera pregunta

      this.questionText = question.text;
      this.questionDescription = question.description || '';
      this.selectedQuestionType = question.question_type;
      this.allowMultipleOptions = question.allow_multiple;
      this.maxSelectableOptions = question.max_options;
      this.showCorrectAnswer = question.options.some((opt: any) => opt.is_correct);
      this.showQuestionDescription = !!question.description;

      // Poblar las opciones
      this.options = question.options.map((opt: any) => ({
        text: opt.text,
        isCorrect: opt.is_correct
      }));

      // Asegurar que haya al menos 4 opciones
      while (this.options.length < 4) {
        this.options.push({ text: '', isCorrect: false });
      }
    }
  }

  // Método para eliminar un cuestionario
  deleteQuestionnaire(questionnaire: any) {
    if (confirm(`¿Estás seguro de que quieres eliminar el cuestionario "${questionnaire.title}"?`)) {
      this.questionnaireService.deleteQuestionnaire(questionnaire.id).subscribe({
        next: (response) => {
          alert('Cuestionario eliminado exitosamente');
          this.loadQuestionnaires(); // Recargar la lista
        },
        error: (error) => {
          console.error('Error deleting questionnaire:', error);
          alert('Error al eliminar el cuestionario');
        }
      });
    }
  }
}
