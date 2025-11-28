import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionnaireService } from '../services/questionnaire.service';

@Component({
  selector: 'app-crear-cuestionario-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-cuestionario-form.html',
  styleUrl: './crear-cuestionario-form.css'
})
export class CrearCuestionarioForm {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private questionnaireService: QuestionnaireService
  ) {}

  // Propiedad para controlar si el sidebar esta colapsado
  isSidebarCollapsed: boolean = false;

  // propiedad para animar las tarjetas de opciones
  animateCards: boolean = false;

  // propiedad para controlar la vista actual
  currentView: 'options' | 'form' | 'cuestionario' = 'options';

  // propiedad para el tipo de pregunta seleccionado en el dropdown
  selectedQuestionType: string = 'multiple';

  // mapeo de tipos de pregunta con sus iconos y nombres
  questionTypeConfig: { [key: string]: { icon: string, name: string} } = {
    'multiple': { icon: 'checklist', name: 'Opción múltiple' },
    'abierta': { icon: 'chat_bubble_outline', name: 'Pregunta abierta' }
  };

  //propiedad computada para obtener la configutracion del tipo actual
  get currentQuestionTypeConfig() {
    return this.questionTypeConfig[this.selectedQuestionType] || this.questionTypeConfig['multiple'];
  }

  // propiedad para mostrar/ocultar el dropdown personalizado
  showDropdown: boolean = false;

  // propiedad para controlar que dropdown de pregunta esta abierto
  activeQuestionDropdown: number | null = null;

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

  // propiedades para el formualrio de opcion multilpe
  questionText: string = '';
  options: { text: string, isCorrect: boolean }[] = [
    { text: '', isCorrect: false},
    { text: '', isCorrect: false},
    { text: '', isCorrect: false},
    { text: '', isCorrect: false}
  ];

  // propiedades para la vista de cuestionario
  questionnaireTitle: string = '';
  showEmptyState: boolean = true;

  // propiedad para controlar si estamos editando una pregunta existente
  isEditing: boolean = false;

  // ID de la pregunta que se esta editando (null si es nueva)
  editingQuestionId: number | null = null;

  // propiedad para el cuestionario actual
  currentQuestionnaireId: number | null = null;
  currentQuestionnaireName: string = '';
  questionnaireQuestions: any[] = []; // Preguntas del cuestionario actual

  // porpiedad para mostrar/ocultar el temporizdor de la pregunta
  showQuestionTimer: boolean = false;

  ngOnInit() {
    // obtener el ID y nombre del cuestionario desde los querry params
    this.route.queryParams.subscribe(params => {
      this.currentQuestionnaireId = params['id'] ? parseInt(params['id']) : null;
      this.currentQuestionnaireName = params['nombre'] || '';
      console.log('Cuestionario actual:', this.currentQuestionnaireId, this.currentQuestionnaireName);

      // Cargar preguntas del cuestionario si tenemos un ID
      if (this.currentQuestionnaireId) {
        this.loadQuestionnaireQuestions();
      }
    });
  }

  // Método para cargar las preguntas del cuestionario actual
  loadQuestionnaireQuestions() {
    if (!this.currentQuestionnaireId) return;

    this.questionnaireService.getQuestionnaire(this.currentQuestionnaireId).subscribe({
      next: (questionnaire) => {
        this.questionnaireQuestions = questionnaire.questions || [];
        console.log('Preguntas cargadas:', this.questionnaireQuestions);
      },
      error: (error) => {
        console.error('Error loading questions:', error);
      }
    });
  }

  // metodo para alternar el estado del sidebar
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // metodo para agregar pregunta
  onAgregarPregunta() {
    // reset flags de edicion para nueva pregunta
    this.isEditing = false;
    this.editingQuestionId = null; 
 
    this.currentView = 'options';
    this.animateCards = true;
  }

  // metodo para seleccionar tipo de pregunta
  seleccionarTipo(tipo: string) {
    if (tipo === 'multiple' || tipo === 'abierta' || tipo === 'questionnaire') {
      this.selectedQuestionType = tipo;

      // Resetea las opciones cuando cambia de tipo de pregunta
      if (tipo === 'abierta') {
        this.allowMultipleOptions = false;
        this.showCorrectAnswer = false;
        this.maxSelectableOptions = 2;
      }

      this.currentView = 'form';
    } else if (tipo === 'cuestionario') {
      this.currentView = 'cuestionario';
    } else {
      alert(`Seleccionaste: ${tipo}`);
    }
  }

  // metodo para agregar opcion
  addOption() {
    this.options.push({ text: '', isCorrect: false });
  }

  // metodo para eliminar opcion
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
    this.showDropdown = false;

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
    // verificar si estamos editando una pregunta existente
    if (this.isEditing && this.editingQuestionId && this.currentQuestionnaireId) {
      // confirmar eliminacion
      if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
        // llamar al servicio para eliminar la pregunta de la base de datos
        this.questionnaireService.deleteQuestionFromQuestionnaire(
          this.currentQuestionnaireId,
          this.editingQuestionId
        ).subscribe({
          next: (response) => {
            alert('Pregunta eliminada exitosamente');
            console.log('Pregunta eliminada:', response);

            // recargar preguntas despues de eliminar
            this.loadQuestionnaireQuestions();

            // reset form y flags de edicion
            this.resetForm();
          },
          error: (error) => {
            console.error('Error al eliminar la pregunta:', error);
            alert('Error al eliminar la pregunta. Revisa la consola para más detalles.');
          }
        });
      }
    } else {
      // si no estamos editando, solo resetear el formulario
      if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
        this.resetForm();
        console.log('Pregunta eliminada del formulario');
      }
    }
  }

  // metodo para mostar /ocultar el dropdown de opciones de pregunta
  toggleQuestionDropdown(questionId: number, event: Event) {
    event.stopPropagation(); // IMPORTANTE: Evita que el click llegue al overlay inmediatamente
    
    if (this.activeQuestionDropdown === questionId) {
      this.activeQuestionDropdown = null; // Si ya está abierto, lo cierra
    } else {
      this.activeQuestionDropdown = questionId; // Si está cerrado, lo abre
    }
  }
  // metodo par duplicar una pregunta
  duplicateQuestion(question: any) {
    if (!this.currentQuestionnaireId) {
      alert('Error: No se econtro el cuestionario atual');
      return;
    }

    // crear una copia de la pregunta con un nuevo texto
    const duplicatedQuestion = {
      ...question,
      text: question.text + ' (copia)',
      id: null // remover el ID para que se cree como nueva
    };

    // agregar la pregunta duplicada al cuestionario
    this.questionnaireService.addQuestionToQuestionnaire(
      this.currentQuestionnaireId,
      duplicatedQuestion
    ).subscribe({
      next: (response) => {
        alert('pregunta duplicada exitosamente');
        console.log('pregunta duplicada:', response);

        // recargar preguntas depues de duplicar
        this.loadQuestionnaireQuestions();

        // crear el dropwdown
        this.activeQuestionDropdown = null;
      },
      error: (error) => {
        console.error('Error al duplicar la pregunta:', error);
        alert('Error al duplicar la pregunta. Revisa la consola para mas detalles.');
      }
    });
  }

  // metodo par eliminar preguntas desde el sidebar
  deleteQuestionFromSidebar(question: any) {
    if (confirm('Estas seguro de que quieres eliminar esta pregunta?')) {
      this.questionnaireService.deleteQuestionFromQuestionnaire(
        this.currentQuestionnaireId!,
        question.id
      ).subscribe({
        next: (response) => {
          alert('Pregunta eliminada exitosamente');
          console.log('Pregunta eliminada:', response);

          // recargar preguntas depues de eliminar
          this.loadQuestionnaireQuestions();

          // cerrar el dropdown
          this.activeQuestionDropdown = null;
        },
        error: (error) => {
          console.error("Error al eliminar la pregunta:", error);
          alert('Error al eliminar la pregunta. Revisa la consola para mas detalle.');
        }
      });
    }
  }

  // Método para guardar pregunta
  saveQuestionnaire() {
    if (!this.questionText.trim()) {
      alert('Por favor ingresa el texto de la pregunta');
      return;
    }

    if (!this.currentQuestionnaireId) {
      alert('Error: No se encontro el cuestionario actual');
      return;
    }

    // preparar los datos de la pregunta
    let questionData: any = {
      text: this.questionText,
      description: this.questionDescription,
      question_type: this.selectedQuestionType,
      allow_multiple: this.allowMultipleOptions,
      max_options: this.maxSelectableOptions
    }

    // manear diferentes tipos de pregunta
    if (this.selectedQuestionType === 'multiple') {
      // para preguntas multiples validar y procesar opciones
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

      questionData.options = validOptions;
    } else if (this.selectedQuestionType === 'abierta') {
      // para preguntas abiertas, no se necesitan opciones
      questionData.options = [];
    }

    // verificar si estamos editando o creando nueva
    if (this.isEditing && this.editingQuestionId) {
      // actualizar pregunta existente
      this.questionnaireService.updateQuestionInQuestionnaire(
        this.currentQuestionnaireId,
        this.editingQuestionId,
        questionData
      ).subscribe({
        next: (response) => {
          alert('pregunta actualizada exitosamente');
          console.log('Pregunta actualizada', response);

          // recargar preguntas depues de actualizar
          this.loadQuestionnaireQuestions();

          // reset form y flags de edicion
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating question:', error);
          alert('Error al actualizar la pregunta. Revisa la consola para mas detalles.');
        }
      });
    } else {
      // crear nueva pregunta
      this.questionnaireService.addQuestionToQuestionnaire(
        this.currentQuestionnaireId,
        questionData
      ).subscribe({
        next: (response) => {
          alert('pregunta agregada exitosamente al cuestionario');
          console.log('Pregunta guardada:', response);

          // recargar preguntas despues de guardar
          this.loadQuestionnaireQuestions();

          // reset form
          this.resetForm();
        },
        error: (error) => {
          console.error('Error saving question:', error);
          alert('Error al guardar la pregunta. Revisa la consola para mas detalles.');
        }
      });
    }


  }

  // metodo para resetear el formulario
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

    // reset flags de edicion
    this.isEditing = false;
    this.editingQuestionId = null;
  }

  // Métodos para el sidebar de configuración
  toggleConfigSidebar() {
    this.showConfigSidebar = !this.showConfigSidebar;
  }

  toggleMultipleOptions() {
    this.allowMultipleOptions = !this.allowMultipleOptions;
  }

  toggleCorrectAnswer() {
    this.showCorrectAnswer = !this.showCorrectAnswer;
  }

  toggleQuestionDescription() {
    this.showQuestionDescription = !this.showQuestionDescription;
  }

  increaseMaxOptions() {
    if (this.maxSelectableOptions < this.options.length) {
      this.maxSelectableOptions++;
    }
  }

  decreaseMaxOptions() {
    if (this.maxSelectableOptions > 1) {
      this.maxSelectableOptions--;
    }
  }

  toggleQuestionTimer() {
    this.showQuestionTimer = !this.showQuestionTimer;
  }

  // Método para editar una pregunta existente
  editQuestion(question: any) {
    // Marcar que estamos editando
    this.isEditing = true;
    this.editingQuestionId = question.id;

    // Cargar los datos de la pregunta en el formulario
    this.questionText = question.text;
    this.questionDescription = question.description || '';
    this.selectedQuestionType = question.question_type;
    this.allowMultipleOptions = question.allow_multiple;
    this.maxSelectableOptions = question.max_options;
    this.showCorrectAnswer = question.options.some((opt: any) => opt.is_correct);
    this.showQuestionDescription = !!question.description;

    // Cargar las opciones
    this.options = question.options.map((opt: any) => ({
      text: opt.text,
      isCorrect: opt.is_correct
    }));

    // Asegurar que haya al menos 4 opciones
    while (this.options.length < 4) {
      this.options.push({ text: '', isCorrect: false });
    }

    // Cambiar a vista de formulario
    this.currentView = 'form';

    console.log('Pregunta cargada para editar:', question);
  }

  // Método para agregar primera pregunta en cuestionario
  addFirstQuestion() {
    this.showEmptyState = false;
    alert('Funcionalidad de cuestionario eliminada. Solo funcionalidad básica disponible.');
  }

 // Método para cerrar todos los dropdowns
  closeAllDropdowns() {
    this.activeQuestionDropdown = null;
  }

  // Listener para cerrar dropdown al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Solo cerrar si hay un dropdown abierto
    if (this.activeQuestionDropdown !== null) {
      this.closeAllDropdowns();
    }
  }

  // metodo par eliminar el cuestionario actual
  deleteQuestionnaire() {
    if (confirm('¿Estás seguro de que quieres eliminar este cuestionario?')) {
      // aqui ira la logica del backend despues
      console.log ('Eliminar cuestionario:', this.currentQuestionnaireId);
    }
  }

  // metodo para añadir otra pregunta de cuestionario
  addAnotherQuestionnaireQuestion() {
    // reset form para nueva pregunta
    this.resetForm();
    // cambiar al tipo questionnaire
    this.seleccionarTipo('questionnaire');
    // aqui ira la logaica del backend desues
    console.log('Añadir otra pregunta de cuestionario');
  }
}
