import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionnaireService } from '../services/questionnaire.service';

@Component({
  selector: 'app-quiz-guest',
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-guest.html',
  styleUrl: './quiz-guest.css'
})
export class QuizGuest implements OnInit, OnDestroy {
  questionnaire: any = null;
  currentQuestionIndex: number = -1; // -1 significa esperando a que el creador inicie
  currentQuestion: any = null;
  isWaiting: boolean = true;
  showResults: boolean = false;
  showNameInput: boolean = false;
  showStoppedMessage: boolean = false;
  guestName: string = '';
  userAnswer: string = '';
  selectedOption: number | null = null;
  hasAnswered: boolean = false;
  hasSelectedOption: boolean = false;
  pollingInterval: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionnaireService: QuestionnaireService
  ) {}

  ngOnInit() {
    // Cargar nombre guardado si existe
    this.guestName = localStorage.getItem('guestName') || '';

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadQuestionnaire(id);
    }
  }

  ngOnDestroy() {
    // Limpiar el intervalo cuando el componente se destruya
    this.stopPolling();
  }

  loadQuestionnaire(id: string) {
    this.questionnaireService.getQuestionnaire(parseInt(id)).subscribe({
      next: (questionnaire) => {
        this.questionnaire = questionnaire;
        console.log('Cuestionario cargado para invitados:', questionnaire);

        // Iniciar polling para verificar si el cuestionario está activo
        this.startPolling();
      },
      error: (error) => {
        console.error('Error loading questionnaire:', error);
        alert('Error al cargar el cuestionario');
        this.router.navigate(['/registro']);
      }
    });
  }

  // Método para iniciar el polling
  startPolling() {
    // Verificar cada 2 segundos si el cuestionario está activo
    this.pollingInterval = setInterval(() => {
      this.checkQuestionnaireStatus();
    }, 2000);
  }

  // Método para detener el polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Método para verificar el estado del cuestionario
  checkQuestionnaireStatus() {
    if (!this.questionnaire?.id) return;

    this.questionnaireService.getQuestionnaire(this.questionnaire.id).subscribe({
      next: (questionnaire) => {
        console.log('Estado del cuestionario recibido:', {
          is_active: questionnaire.is_active,
          active_cuestionario: questionnaire.active_cuestionario,
          current_question_index: questionnaire.current_question_index
        });

        // Actualizar el cuestionario con los datos más recientes
        this.questionnaire = questionnaire;

        // Si el cuestionario está activo y estamos esperando
        if (questionnaire.is_active && this.isWaiting && !this.showNameInput) {
          // Si ya tenemos un nombre guardado, mostrar mensaje de listo para responder
          if (this.guestName) {
            console.log('Cuestionario activado, invitado listo para responder');
            console.log('Active cuestionario:', questionnaire.active_cuestionario);
            console.log('Nombre que se mostrará:', this.getActiveCuestionarioName());
            // El invitado ya tiene nombre, se queda esperando la primera pregunta
          } else {
            // Si no tenemos nombre, mostrar pantalla para ingresar nombre
            console.log('Cuestionario activado, invitado debe ingresar nombre');
            this.showNameInput = true;
          }
        }
        // Si el cuestionario está activo Y hay una pregunta actual establecida y tenemos nombre, mostrarla
        else if (questionnaire.is_active && questionnaire.current_question_index !== null && this.guestName && !this.showNameInput) {
          this.showFirstQuestion(questionnaire);
        }
        // Si el cuestionario se desactivó, mostrar mensaje de detenido
        else if (!questionnaire.is_active && this.questionnaire?.is_active) {
          console.log('Anfitrión detuvo el cuestionario');
          this.showQuestionnaireStopped();
        }
      },
      error: (error) => {
        console.error('Error checking questionnaire status:', error);
      }
    });
  }

  // Método simplificado para mostrar la primera pregunta del sub-cuestionario activo
  showFirstQuestion(questionnaire: any) {
    console.log('Intentando mostrar primera pregunta del sub-cuestionario activo');
    console.log('Active cuestionario:', questionnaire.active_cuestionario);

    let firstQuestion = null;

    // Si hay un sub-cuestionario activo específico, tomar su primera pregunta
    if (questionnaire.active_cuestionario && questionnaire.active_cuestionario.question_set && questionnaire.active_cuestionario.question_set.length > 0) {
      firstQuestion = questionnaire.active_cuestionario.question_set[0];
      console.log('Tomando primera pregunta del sub-cuestionario activo:', questionnaire.active_cuestionario.name);
    } else {
      console.log('No hay sub-cuestionario activo o no tiene preguntas');
      // Fallback: buscar en cualquier sub-cuestionario que tenga preguntas
      if (questionnaire.cuestionarios && questionnaire.cuestionarios.length > 0) {
        console.log('Buscando en otros sub-cuestionarios como fallback');
        for (const subCuestionario of questionnaire.cuestionarios) {
          if (subCuestionario.question_set && subCuestionario.question_set.length > 0) {
            firstQuestion = subCuestionario.question_set[0];
            console.log('Encontrada primera pregunta en fallback:', firstQuestion.text);
            break;
          }
        }
      }
    }

    if (firstQuestion) {
      console.log('Mostrando pregunta al invitado:', firstQuestion.text);
      // Crear un array temporal con la pregunta para mantener compatibilidad
      const tempQuestions = [firstQuestion];
      this.questionnaire.questions = tempQuestions;
      this.startQuestion(0);
    } else {
      console.log('No se encontró ninguna pregunta para mostrar al invitado');
    }
  }

  // Método que será llamado cuando el creador inicie una pregunta
  startQuestion(questionIndex: number) {
    if (this.questionnaire && this.questionnaire.questions[questionIndex]) {
      this.currentQuestionIndex = questionIndex;
      this.currentQuestion = this.questionnaire.questions[questionIndex];
      this.isWaiting = false;
      this.showResults = false;

      // Resetear estado de respuesta para la nueva pregunta
      this.selectedOption = null;
      this.hasAnswered = false;
      this.hasSelectedOption = false;
      this.userAnswer = '';

      // Intentar restaurar estado guardado desde localStorage
      const savedSelectedOption = localStorage.getItem('selectedOption');
      const savedHasSelectedOption = localStorage.getItem('hasSelectedOption');

      if (savedSelectedOption && savedHasSelectedOption === 'true') {
        this.selectedOption = parseInt(savedSelectedOption);
        this.hasSelectedOption = true;
        console.log('Estado de selección restaurado:', this.selectedOption);
      } else {
        // Limpiar el estado guardado si no hay nada que restaurar
        localStorage.removeItem('selectedOption');
        localStorage.removeItem('hasSelectedOption');
      }
    }
  }

  // Método para mostrar resultados
  showQuestionResults() {
    // Marcar que ya se mostró la respuesta correcta
    this.hasAnswered = true;
    this.showResults = true;

    // Limpiar el estado guardado ya que se envió la respuesta
    localStorage.removeItem('selectedOption');
    localStorage.removeItem('hasSelectedOption');

    console.log('Respuesta enviada. Mostrando resultados correctos.');
  }

  // Método para volver a esperar
  backToWaiting() {
    this.isWaiting = true;
    this.currentQuestionIndex = -1;
    this.currentQuestion = null;
    this.showResults = false;
  }

  // Método para mostrar la pantalla de ingreso de nombre
  showNameInputScreen() {
    this.showNameInput = true;
  }

  // Método para continuar con el cuestionario después de ingresar el nombre
  continueWithQuiz() {
    if (this.guestName.trim()) {
      // Aquí puedes guardar el nombre en localStorage o enviarlo al servidor
      localStorage.setItem('guestName', this.guestName.trim());
      this.showNameInput = false;
      console.log('Nombre del invitado:', this.guestName);

      // Después de ingresar el nombre, volver a la pantalla de espera
      this.isWaiting = true;
    } else {
      alert('Por favor ingresa tu nombre para continuar');
    }
  }

  // Método para volver a la pantalla de pregunta sin nombre
  backToWaitingWithoutName() {
    this.showNameInput = false;
    this.guestName = '';
  }

  // Método para mostrar mensaje cuando el anfitrión detiene el cuestionario
  showQuestionnaireStopped() {
    // Detener el polling
    this.stopPolling();

    // Mostrar mensaje de cuestionario detenido
    this.showStoppedMessage = true;
    this.isWaiting = false;
    this.showResults = false;
    this.showNameInput = false;
  }

  // Método para desconectar al invitado cuando el anfitrión cierra sesión
  disconnectGuest() {
    // Detener el polling
    this.stopPolling();

    // Limpiar datos del invitado
    this.guestName = '';
    localStorage.removeItem('guestName');

    // Mostrar mensaje y redirigir al login
    alert('El anfitrión ha cerrado sesión. Serás redirigido al inicio de sesión.');
    this.router.navigate(['/login']);
  }

  // Método para obtener el nombre del cuestionario activo
  getActiveCuestionarioName(): string {
    if (!this.questionnaire?.is_active) {
      return this.questionnaire?.title || 'Cargando...';
    }

    // Si hay un sub-cuestionario activo específico, mostrar su nombre
    if (this.questionnaire.active_cuestionario) {
      return this.questionnaire.active_cuestionario.name;
    }

    // Si no hay sub-cuestionario activo, mostrar el nombre del cuestionario principal
    return this.questionnaire.title || 'Cuestionario activo';
  }

  // Método para formatear el tiempo del temporizador
  formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds === 0) {
        return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
      } else {
        return `${minutes} minuto${minutes !== 1 ? 's' : ''} ${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''}`;
      }
    }
  }

  // Método para seleccionar una opción
  selectOption(optionIndex: number) {
    if (this.hasAnswered) return; // Solo impedir cambiar después de enviar respuesta

    // Permitir cambiar selección antes de enviar respuesta
    this.selectedOption = optionIndex;
    this.hasSelectedOption = true;

    // Guardar el estado de selección en localStorage
    localStorage.setItem('selectedOption', optionIndex.toString());
    localStorage.setItem('hasSelectedOption', 'true');

    // Aquí podrías enviar la respuesta al servidor si fuera necesario
    console.log('Opción seleccionada:', optionIndex);
  }

  // Método para obtener la clase CSS de una opción
  getOptionClass(optionIndex: number): string {
    if (optionIndex === this.selectedOption) {
      if (this.hasAnswered) {
        // Después de enviar respuesta, mostrar colores de correcto/incorrecto
        const option = this.currentQuestion.options[optionIndex];
        return option.is_correct ? 'option-item correct-selected' : 'option-item incorrect-selected';
      } else if (this.hasSelectedOption) {
        // Opción seleccionada pero aún no se enviaron resultados
        return 'option-item selected';
      }
    }

    if (this.hasAnswered) {
      // Después de enviar respuesta, mostrar todas las opciones correctas
      const option = this.currentQuestion.options[optionIndex];
      if (option.is_correct && optionIndex !== this.selectedOption) {
        return 'option-item correct-unselected';
      }
    }

    return 'option-item'; // Estado normal
  }

  // Método para obtener el icono de resultado
  getResultIcon(optionIndex: number): string {
    if (!this.hasAnswered) return '';

    const option = this.currentQuestion.options[optionIndex];

    if (optionIndex === this.selectedOption) {
      // Opción seleccionada por el usuario
      return option.is_correct ? 'check_circle' : 'cancel';
    } else if (option.is_correct) {
      // Opción correcta no seleccionada
      return 'check_circle';
    } else {
      // Opción incorrecta no seleccionada
      return '';
    }
  }

  // Método para obtener la clase CSS del indicador de resultado
  getResultIconClass(optionIndex: number): string {
    if (!this.hasAnswered) return '';

    const option = this.currentQuestion.options[optionIndex];

    if (optionIndex === this.selectedOption) {
      // Opción seleccionada por el usuario
      return option.is_correct ? 'correct' : 'incorrect';
    } else if (option.is_correct) {
      // Opción correcta no seleccionada
      return 'correct';
    } else {
      // Opción incorrecta no seleccionada
      return '';
    }
  }

  // Método para convertir índice a letra (A, B, C, etc.)
  indexToLetter(index: number): string {
    return String.fromCharCode(65 + index); // 65 es el código ASCII de 'A'
  }
}
