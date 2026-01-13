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

  // Propiedad para controlar si el sidebar está colapsado
  isSidebarCollapsed: boolean = false;

  // Propiedad para animar las tarjetas de opciones
  animateCards: boolean = false;

  // Propiedad para controlar la vista actual
  currentView: 'options' | 'form' | 'cuestionario' = 'options';

  // Propiedad para el tipo de pregunta seleccionado en el dropdown
  selectedQuestionType: string = 'multiple';

  // Mapeo de tipos de pregunta con sus iconos y nombres
  questionTypeConfig: { [key: string]: { icon: string, name: string} } = {
    'multiple': { icon: 'checklist', name: 'Opción múltiple' },
    'abierta': { icon: 'chat_bubble_outline', name: 'Pregunta abierta' }
  };

  // Propiedad computada para obtener la configuración del tipo actual
  get currentQuestionTypeConfig() {
    return this.questionTypeConfig[this.selectedQuestionType] || this.questionTypeConfig['multiple'];
  }

  // Propiedad para mostrar/ocultar el dropdown personalizado
  showDropdown: boolean = false;

  // Propiedad para controlar qué dropdown de pregunta está abierto
  activeQuestionDropdown: number | null = null;

  // Para sidebar derecho de configuración de pregunta
  showConfigSidebar: boolean = false;

  // Propiedad para controlar si se permiten varias opciones seleccionadas
  allowMultipleOptions: boolean = false;

  // Propiedad para el número máximo de opciones seleccionables
  maxSelectableOptions: number = 2;

  // Propiedad para mostrar/ocultar la respuesta correcta
  showCorrectAnswer: boolean = false;

  // Propiedad para mostrar/ocultar la descripción de la pregunta
  showQuestionDescription: boolean = false;

  // Propiedad para el texto de la descripción
  questionDescription: string ='';

  // Propiedad para el temporizador seleccionado
  selectedTimer: number = 20;

  // Getter para verificar si hay al menos una respuesta correcta marcada
  get hasCorrectAnswers(): boolean {
    return this.options.some(option => option.isCorrect);
  }

  // Propiedades para el formulario de opción múltiple
  questionText: string = '';
  options: { text: string, isCorrect: boolean }[] = [
    { text: '', isCorrect: false},
    { text: '', isCorrect: false},
    { text: '', isCorrect: false},
    { text: '', isCorrect: false}
  ];

  // Propiedades para la vista de cuestionario
  questionnaireTitle: string = '';
  showEmptyState: boolean = true;
  selectedCuestionarioId: number | null = null; // ID del cuestionario seleccionado para editar

  // Propiedad para controlar si estamos editando una pregunta existente
  isEditing: boolean = false;

  // ID de la pregunta que se está editando (null si es nueva)
  editingQuestionId: number | null = null;

  // Propiedad para el cuestionario actual
  currentQuestionnaireId: number | null = null;
  currentQuestionnaireName: string = '';
  currentQuestionnaire: any = null; // Objeto completo del cuestionario actual
  questionnaireQuestions: any[] = []; // Preguntas del cuestionario actual
  cuestionarios: any[] = []; // Cuestionarios del cuestionario actual
  cuestionarioQuestions: any[] = []; // Preguntas del cuestionario seleccionado

  // Propiedad para mostrar/ocultar el temporizador de la pregunta
  showQuestionTimer: boolean = false;

  // Propiedad para mostrar/ocultar el dropdown del temporizador
  showTimerDropdown: boolean = false;

  // Propiedad para mostrar/ocultar los botones de control del cuestionario
  showQuestionnaireControls: boolean = false;



  // Propiedades para el sistema de toast
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

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

  // Método para cargar las preguntas y cuestionarios del cuestionario actual
  loadQuestionnaireQuestions() {
    if (!this.currentQuestionnaireId) return;

    this.questionnaireService.getQuestionnaire(this.currentQuestionnaireId).subscribe({
      next: (questionnaire) => {
        // Guardar el cuestionario completo para acceder al código
        this.currentQuestionnaire = questionnaire;
        // El backend ya filtra las preguntas para mostrar solo las del cuestionario principal
        this.questionnaireQuestions = questionnaire.questions || [];
        this.cuestionarios = questionnaire.cuestionarios || [];
        console.log('Preguntas cargadas (solo del cuestionario principal):', this.questionnaireQuestions);
        console.log('Cuestionarios cargados:', this.cuestionarios);
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
      max_options: this.maxSelectableOptions,
      time: this.showQuestionTimer ? this.selectedTimer : null
    }

    // Si estamos en un cuestionario, agregar cuestionario_id
    if (this.selectedCuestionarioId) {
      questionData.cuestionario_id = this.selectedCuestionarioId;
    }

    // manejar diferentes tipos de pregunta
    if (this.selectedQuestionType === 'multiple' || this.selectedQuestionType === 'questionnaire') {
      // para preguntas multiples y de cuestionario, procesar opciones
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

          // recargar preguntas despues de actualizar
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
    // Si se activa el temporizador, establecer automáticamente en 20 segundos
    if (this.showQuestionTimer) {
      this.selectedTimer = 20;
    }
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

  // metodo par eliminar el cuestionario actual o cuestionario seleccionado
  deleteQuestionnaire() {
    if (this.selectedCuestionarioId) {
      // Eliminar cuestionario seleccionado
      if (confirm('¿Estás seguro de que quieres eliminar este cuestionario?')) {
        this.questionnaireService.deleteCuestionario(this.currentQuestionnaireId!, this.selectedCuestionarioId).subscribe({
          next: (response) => {
            alert('Cuestionario eliminado exitosamente');
            console.log('Cuestionario eliminado:', response);

            // Recargar datos
            this.loadQuestionnaireQuestions();

            // Resetear selección
            this.selectedCuestionarioId = null;
            this.questionnaireTitle = '';
            this.currentView = 'options';
            this.showEmptyState = true;
          },
          error: (error) => {
            console.error('Error al eliminar cuestionario:', error);
            alert('Error al eliminar cuestionario. Revisa la consola para más detalles.');
          }
        });
      }
    } else {
      // Eliminar el cuestionario completo (no implementado aún)
      if (confirm('¿Estás seguro de que quieres eliminar este cuestionario completo?')) {
        console.log('Eliminar cuestionario completo:', this.currentQuestionnaireId);
        // Aquí iría la lógica para eliminar el cuestionario completo
      }
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

  // metodo para seleccionar un cuestionario existente
  selectCuestionario(cuestionario: any) {
    this.questionnaireTitle = cuestionario.name;
    this.selectedCuestionarioId = cuestionario.id;
    this.currentView = 'cuestionario';

    // Cargar preguntas del cuestionario
    if (this.currentQuestionnaireId) {
      this.questionnaireService.getCuestionarioQuestions(this.currentQuestionnaireId, cuestionario.id).subscribe({
        next: (questions) => {
          this.cuestionarioQuestions = questions;
          this.showEmptyState = false; // Ocultar estado vacío ya que tenemos preguntas
          console.log('Preguntas del cuestionario cargadas:', questions);
        },
        error: (error) => {
          console.error('Error loading cuestionario questions:', error);
          alert('Error al cargar las preguntas del cuestionario');
        }
      });
    }
  }

  // metodo para añadir pregunta al cuestionario seleccionado
  addQuestionToCuestionario() {
    this.seleccionarTipo('questionnaire');
  }

  // metodo para agregar o actualizar un cuestionario
  addCuestionario() {
    if (!this.questionnaireTitle.trim()) {
      alert('Por favor ingresa el nombre del cuestionario');
      return;
    }

    if (!this.currentQuestionnaireId) {
      alert('Error: No se encontró el cuestionario actual');
      return;
    }

    if (this.selectedCuestionarioId) {
      // Actualizar cuestionario existente
      this.questionnaireService.updateCuestionario(
        this.currentQuestionnaireId,
        this.selectedCuestionarioId,
        this.questionnaireTitle
      ).subscribe({
        next: (response) => {
          alert('Cuestionario actualizado exitosamente');
          console.log('Cuestionario actualizado:', response);

          // Recargar cuestionarios
          this.loadQuestionnaireQuestions();

          // Resetear
          this.questionnaireTitle = '';
          this.selectedCuestionarioId = null;
          this.currentView = 'options';
          this.showEmptyState = false;
        },
        error: (error) => {
          console.error('Error al actualizar cuestionario:', error);
          alert('Error al actualizar cuestionario. Revisa la consola para más detalles.');
        }
      });
    } else {
      // Crear nuevo cuestionario
      this.questionnaireService.addCuestionarioToQuestionnaire(
        this.currentQuestionnaireId,
        this.questionnaireTitle
      ).subscribe({
        next: (response) => {
          alert('Cuestionario agregado exitosamente');
          console.log('Cuestionario agregado:', response);

          // Recargar cuestionarios
          this.loadQuestionnaireQuestions();

          // Resetear el título y cambiar vista
          this.questionnaireTitle = '';
          this.currentView = 'options';
          this.showEmptyState = false; // Ocultar estado vacío
        },
        error: (error) => {
          console.error('Error al agregar cuestionario:', error);
          alert('Error al agregar cuestionario. Revisa la consola para más detalles.');
        }
      });
    }
  }

  // metodo para mostrar/ocultar el dropdown del temporizador
  toggleTimerDropdown() {
    this.showTimerDropdown = !this.showTimerDropdown;
  }

  // metodo para obtener el texto a mostrar del temporizador
  getTimerDisplayText(): string {
    if (!this.showQuestionTimer) {
      return 'Sin temporizador';
    } else if (this.selectedTimer === 0) {
      return 'Sin temporizador';
    } else if (this.selectedTimer < 60) {
      return `${this.selectedTimer} segundos`;
    } else {
      const minutes = Math.floor(this.selectedTimer / 60);
      return `${minutes} minuto${minutes > 1 ? 's' : ''}`;
    }
  }

  // metodo para seleccionar un tiempo del temporizador
  selectTimer(seconds: number) {
    this.selectedTimer = seconds;
    // Si selecciona un tiempo > 0, activar el toggle del sidebar
    // Si selecciona "Sin temporizador" (0), desactivar el toggle del sidebar
    this.showQuestionTimer = seconds > 0;
    this.showTimerDropdown = false;
  }

  // Método para mostrar mensajes toast
  showToastMessage(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Ocultar automáticamente después de 3 segundos
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // Método para copiar el código de acceso al portapapeles
  copyAccessCode() {
    if (this.currentQuestionnaire?.access_code) {
      navigator.clipboard.writeText(this.currentQuestionnaire.access_code).then(() => {
        this.showToastMessage(`¡Código ${this.currentQuestionnaire.access_code} copiado!`, 'success');
      }).catch(err => {
        console.error('Error al copiar:', err);
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = this.currentQuestionnaire.access_code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showToastMessage(`¡Código ${this.currentQuestionnaire.access_code} copiado!`, 'success');
      });
    }
  }

  // Método para iniciar con el cuestionario
  startQuestionnaire() {
    if (!this.currentQuestionnaireId) {
      alert('Error: No se encontró el cuestionario actual');
      return;
    }

    console.log('Iniciando cuestionario con sub-cuestionario seleccionado:', this.selectedCuestionarioId);

    // Usar el endpoint que maneja active_cuestionario
    const requestData = {
      is_active: true,
      active_cuestionario: this.selectedCuestionarioId || null,
      current_question_index: null  // Resetear la pregunta actual al iniciar
    };

    // Llamar al endpoint PATCH para activar y establecer el sub-cuestionario activo
    fetch(`http://127.0.0.1:8000/api/questionnaires/${this.currentQuestionnaireId}/toggle_active/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Respuesta del servidor:', data);
      this.showQuestionnaireControls = true;
      this.showToastMessage('¡Cuestionario iniciado! Los invitados pueden comenzar a responder.', 'success');
    })
    .catch(error => {
      console.error('Error al activar cuestionario:', error);
      alert('Error al iniciar el cuestionario');
    });
  }

  // Método para detener el cuestionario
  stopQuestionnaire() {
    if (!this.currentQuestionnaireId) {
      alert('Error: No se encontró el cuestionario actual');
      return;
    }

    console.log('Deteniendo cuestionario:', this.currentQuestionnaireId);

    this.questionnaireService.toggleQuestionnaireActive(this.currentQuestionnaireId, false).subscribe({
      next: (response) => {
        console.log('Respuesta al detener cuestionario:', response);
        this.showQuestionnaireControls = false;
        this.showToastMessage('Cuestionario detenido. Los invitados ya no pueden responder.', 'success');
        console.log('Cuestionario desactivado exitosamente');
      },
      error: (error) => {
        console.error('Error al desactivar cuestionario:', error);
        alert('Error al detener el cuestionario');
      }
    });
  }

  // Método para ir a la primera pregunta
  goToFirstQuestion() {
    if (!this.currentQuestionnaireId) {
      alert('Error: No se encontró el cuestionario actual');
      return;
    }

    console.log('goToFirstQuestion called');
    console.log('selectedCuestionarioId:', this.selectedCuestionarioId);

    const questionnaireId = this.currentQuestionnaireId; // Variable local para evitar problemas de tipo

    // Obtener el cuestionario completo para acceder a los sub-cuestionarios
    this.questionnaireService.getQuestionnaire(questionnaireId).subscribe({
      next: (questionnaire) => {
        console.log('Cuestionario obtenido para primera pregunta:', {
          cuestionarios: questionnaire.cuestionarios,
          questions: questionnaire.questions,
          active_cuestionario: questionnaire.active_cuestionario
        });

        let firstQuestion = null;
        let questionIndex: number = 0;

        // Si hay un sub-cuestionario activo, tomar su primera pregunta
        console.log('Verificando active_cuestionario:', questionnaire.active_cuestionario);
        if (questionnaire.active_cuestionario) {
          console.log('Active cuestionario existe:', questionnaire.active_cuestionario);
          console.log('Question set:', questionnaire.active_cuestionario.question_set);
          if (questionnaire.active_cuestionario.question_set && questionnaire.active_cuestionario.question_set.length > 0) {
            firstQuestion = questionnaire.active_cuestionario.question_set[0];
            console.log('Tomando primera pregunta del sub-cuestionario ACTIVO:', questionnaire.active_cuestionario.name);
          } else {
            console.log('Active cuestionario no tiene question_set o está vacío');
          }
        } else {
          console.log('No hay active_cuestionario');
        }

        // Si no hay activo pero hay seleccionado, tomar del seleccionado
        if (!firstQuestion && this.selectedCuestionarioId) {
          console.log('Buscando sub-cuestionario seleccionado ID:', this.selectedCuestionarioId);
          console.log('Cuestionarios disponibles:', questionnaire.cuestionarios);
          const selectedSubCuestionario = questionnaire.cuestionarios?.find(
            (sub: any) => {
              console.log('Comparando sub.id:', sub.id, 'con selectedCuestionarioId:', this.selectedCuestionarioId);
              return sub.id === this.selectedCuestionarioId;
            }
          );

          console.log('Sub-cuestionario encontrado:', selectedSubCuestionario);
          if (selectedSubCuestionario) {
            console.log('Question set del seleccionado:', selectedSubCuestionario.question_set);
            if (selectedSubCuestionario.question_set && selectedSubCuestionario.question_set.length > 0) {
              firstQuestion = selectedSubCuestionario.question_set[0];
              console.log('Tomando primera pregunta del sub-cuestionario SELECCIONADO:', selectedSubCuestionario.name);
            } else {
              console.log('Sub-cuestionario seleccionado no tiene question_set o está vacío');
            }
          } else {
            console.log('No se encontró el sub-cuestionario seleccionado');
          }
        }

        // Fallback: buscar el primer sub-cuestionario con preguntas
        if (!firstQuestion) {
          const subCuestionarios = questionnaire.cuestionarios || [];
          for (const subCuestionario of subCuestionarios) {
            if (subCuestionario.question_set && subCuestionario.question_set.length > 0) {
              firstQuestion = subCuestionario.question_set[0];
              console.log('Tomando primera pregunta del primer sub-cuestionario disponible:', subCuestionario.name);
              break;
            }
          }
        }

        // Último fallback: preguntas principales
        if (!firstQuestion && questionnaire.questions && questionnaire.questions.length > 0) {
          firstQuestion = questionnaire.questions[0];
          console.log('Tomando primera pregunta de las preguntas principales');
        }

        if (!firstQuestion) {
          alert('No hay preguntas guardadas en este cuestionario');
          return;
        }

        console.log('Pregunta que se va a mostrar:', firstQuestion);

        // Establecer como pregunta actual en el backend
        this.questionnaireService.setCurrentQuestion(questionnaireId, questionIndex || 0).subscribe({
          next: (response) => {
            // Mostrar mensaje de éxito
            this.showToastMessage(`¡Pregunta mostrada! "${firstQuestion.text}"`, 'success');

            console.log('Primera pregunta establecida para invitados:', firstQuestion);
          },
          error: (error) => {
            console.error('Error al establecer pregunta actual:', error);
            alert('Error al mostrar la pregunta a los invitados');
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener cuestionario:', error);
        alert('Error al cargar el cuestionario');
      }
    });
  }



  // Método para convertir índice a letra (A, B, C, etc.)
  indexToLetter(index: number): string {
    return String.fromCharCode(65 + index); // 65 es el código ASCII de 'A'
  }
}
