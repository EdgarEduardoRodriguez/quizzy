import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private questionnaireService: QuestionnaireService
  ) {}

  // Propiedades del cuestionario actual
  currentQuestionnaireId: number | null = null;
  currentQuestionnaireName: string = '';

  // Propiedad para almacenar las preguntas del cuestionario actual
  questions: any[] = [];

  // Propiedad para controlar si estamos editando una pregunta existente
  isEditing: boolean = false;
  editingQuestionId: number | null = null;

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

  //contador de preguntas especifico del cuestionario
  questionnaireQuestionsCount: number = 0;

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
  showQuestionsContainer: boolean = false;
  questionnaireQuestions: any[] = [];

  // propiedades para cuestionarios guardados
  savedQuestionnaires: any[] = [];
  isQuestionnaireSaved: boolean = false;
  savedQuestionnaireId: number | null = null;

  ngOnInit() {
    // Obtener el ID y nombre del cuestionario desde los query params
    this.route.queryParams.subscribe(params => {
      this.currentQuestionnaireId = params['id'] ? parseInt(params['id']) : null;
      this.currentQuestionnaireName = params['nombre'] || '';

      if (this.currentQuestionnaireId) {
        this.loadQuestionsForQuestionnaire(this.currentQuestionnaireId);
      }
    });

    // Cargar cuestionarios guardados
    this.loadSavedQuestionnaires();
  }

  // Método para cargar las preguntas de un cuestionario específico
  loadQuestionsForQuestionnaire(questionnaireId: number) {
    this.questionnaireService.getQuestionnaire(questionnaireId).subscribe({
      next: (questionnaire) => {
        this.questions = questionnaire.questions || [];
        console.log('Preguntas cargadas:', this.questions);
      },
      error: (error) => {
        console.error('Error loading questions:', error);
      }
    });
  }

  // Detectar clicks fuera del menú para cerrarlo
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    // Cerrar todos los menús si se hace click fuera
    this.questions.forEach(q => {
      q.showMenu = false;
    });
  }

  volverHome() {
    this.router.navigate(['/home']);
  }

  // metodo para alternar el estado del sidebar
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onAgregarPregunta() {
    this.currentView = 'options';
    this.animateCards = true;
  }

  seleccionarTipo(tipo: string) {
    if (tipo === 'multiple' || tipo === 'abierta') {
      this.selectedQuestionType = tipo;

      // Resetea las opciones cuando cambia de tipo de pregunta
      if (tipo === 'abierta') {
        // For open text questions, disable multiple choice specific options
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

  // Método para guardar pregunta en el cuestionario actual
  saveQuestionnaire() {
    if (!this.questionText.trim()) {
      alert('Por favor ingresa el texto de la pregunta');
      return;
    }

    if (!this.currentQuestionnaireId) {
      alert('Error: No se encontró el cuestionario actual');
      return;
    }

    let questionData: any = {
      text: this.questionText,
      description: this.questionDescription,
      question_type: this.selectedQuestionType,
      allow_multiple: this.allowMultipleOptions,
      max_options: this.maxSelectableOptions
    };

    // Manejar diferentes tipos de pregunta
    if (this.selectedQuestionType === 'multiple') {
      // Para preguntas múltiples, validar y procesar opciones
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
      // Para preguntas abiertas, no se necesitan opciones
      questionData.options = [];
    } else {
      // Para otros tipos (como cuestionario), usar opciones vacías por ahora
      questionData.options = [];
    }

    // Agregar o actualizar la pregunta según si estamos editando
    if (this.isEditing && this.editingQuestionId) {
      // Actualizar pregunta existente
      this.questionnaireService.updateQuestionInQuestionnaire(this.currentQuestionnaireId, this.editingQuestionId, questionData).subscribe({
        next: (response) => {
          alert('Pregunta actualizada exitosamente');
          this.loadQuestionsForQuestionnaire(this.currentQuestionnaireId!); // Recargar preguntas
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating question:', error);
          alert('Error al actualizar la pregunta');
        }
      });
    } else {
      // Agregar nueva pregunta
      this.questionnaireService.addQuestionToQuestionnaire(this.currentQuestionnaireId, questionData).subscribe({
        next: (response) => {
          alert('Pregunta agregada exitosamente al cuestionario');
          this.loadQuestionsForQuestionnaire(this.currentQuestionnaireId!); // Recargar preguntas
          this.resetForm();
        },
        error: (error) => {
          console.error('Error saving question:', error);
          alert('Error al guardar la pregunta');
        }
      });
    }
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

    // Reset editing flags
    this.isEditing = false;
    this.editingQuestionId = null;
  }

  // Método para mostrar/ocultar el menú de opciones
  toggleMenu(event: Event, question: any) {
    event.stopPropagation(); // Evitar que se propague el click

    // Cerrar otros menús abiertos
    this.questions.forEach(q => {
      if (q !== question) {
        q.showMenu = false;
      }
    });

    // Toggle el menú de la pregunta actual
    question.showMenu = !question.showMenu;
  }

  // Método para cargar una pregunta para editarla
  loadQuestionForEditing(question: any) {
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

  // Método para duplicar una pregunta
  duplicateQuestion(question: any) {
    // Crear una copia de la pregunta
    const duplicatedQuestion = {
      text: question.text + ' (Copia)',
      description: question.description,
      question_type: question.question_type,
      allow_multiple: question.allow_multiple,
      max_options: question.max_options,
      options: question.options.map((opt: any) => ({
        text: opt.text,
        is_correct: opt.is_correct
      }))
    };

    // Agregar la pregunta duplicada al cuestionario
    this.questionnaireService.addQuestionToQuestionnaire(this.currentQuestionnaireId!, duplicatedQuestion).subscribe({
      next: (response) => {
        alert('Pregunta duplicada exitosamente');
        this.loadQuestionsForQuestionnaire(this.currentQuestionnaireId!); // Recargar preguntas
      },
      error: (error) => {
        console.error('Error duplicating question:', error);
        alert('Error al duplicar la pregunta');
      }
    });

    question.showMenu = false;
  }

  // Método para eliminar una pregunta
  deleteQuestionFromQuestionnaire(question: any) {
    if (confirm(`¿Estás seguro de que quieres eliminar la pregunta "${question.text}"?`)) {
      this.questionnaireService.deleteQuestionFromQuestionnaire(this.currentQuestionnaireId!, question.id).subscribe({
        next: (response) => {
          alert('Pregunta eliminada exitosamente');
          this.loadQuestionsForQuestionnaire(this.currentQuestionnaireId!); // Recargar preguntas
        },
        error: (error) => {
          console.error('Error deleting question:', error);
          alert('Error al eliminar la pregunta');
        }
      });
    }
    question.showMenu = false;
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

  // Métodos para la vista de cuestionario
  addFirstQuestion() {
    this.showEmptyState = false;
    this.showQuestionsContainer = true;
    this.addQuestionnaireQuestion();
  }

  addQuestionnaireQuestion() {
    const questionNumber = this.questionnaireQuestions.length + 1;
    const newQuestion = {
      id: Date.now(), // ID temporal
      text: '',
      type: 'text', // Por defecto respuesta corta
      isFocused: true
    };

    this.questionnaireQuestions.push(newQuestion);
  }

  deleteQuestionnaireQuestion(questionId: number) {
    this.questionnaireQuestions = this.questionnaireQuestions.filter(q => q.id !== questionId);
    if (this.questionnaireQuestions.length === 0) {
      this.showEmptyState = true;
      this.showQuestionsContainer = false;
    }
  }

  // Método para cargar cuestionarios guardados
  loadSavedQuestionnaires() {
    this.questionnaireService.getSavedQuestionnaires().subscribe({
      next: (data) => {
        this.savedQuestionnaires = data;
        console.log('Cuestionarios guardados cargados:', this.savedQuestionnaires);
      },
      error: (error) => {
        console.error('Error loading saved questionnaires:', error);
      }
    });
  }

  // Método para guardar el cuestionario completo
  saveCompleteQuestionnaire() {
    if (!this.questionnaireTitle.trim()) {
      alert('Por favor ingresa un título para el cuestionario');
      return;
    }

    if (this.questions.length === 0) {
      alert('El cuestionario debe tener al menos una pregunta');
      return;
    }

    const questionnaireData = {
      title: this.questionnaireTitle,
      description: '',
      questions: this.questions
    };

    this.questionnaireService.saveQuestionnaire(questionnaireData).subscribe({
      next: (response) => {
        alert('Cuestionario guardado exitosamente');
        this.isQuestionnaireSaved = true;
        this.savedQuestionnaireId = response.id;
        this.loadSavedQuestionnaires(); // Recargar la lista
        console.log('Cuestionario guardado:', response);
      },
      error: (error) => {
        console.error('Error saving questionnaire:', error);
        alert('Error al guardar el cuestionario');
      }
    });
  }

  // Método para seleccionar un cuestionario guardado
  selectSavedQuestionnaire(questionnaire: any) {
    this.questionnaireTitle = questionnaire.title;
    this.questions = questionnaire.questions_data || [];
    this.isQuestionnaireSaved = true;
    this.savedQuestionnaireId = questionnaire.id;
    this.currentView = 'cuestionario';
  }
}
