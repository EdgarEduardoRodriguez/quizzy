import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuestionnaireService } from '../services/questionnaire.service';

@Component({
  selector: 'app-quiz-guest',
  imports: [CommonModule],
  templateUrl: './quiz-guest.html',
  styleUrl: './quiz-guest.css'
})
export class QuizGuest implements OnInit {
  questionnaire: any = null;
  currentQuestionIndex: number = -1; // -1 significa esperando a que el creador inicie
  currentQuestion: any = null;
  isWaiting: boolean = true;
  showResults: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionnaireService: QuestionnaireService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadQuestionnaire(id);
    }
  }

  loadQuestionnaire(id: string) {
    this.questionnaireService.getQuestionnaire(parseInt(id)).subscribe({
      next: (questionnaire) => {
        this.questionnaire = questionnaire;
        console.log('Cuestionario cargado para invitados:', questionnaire);
      },
      error: (error) => {
        console.error('Error loading questionnaire:', error);
        alert('Error al cargar el cuestionario');
        this.router.navigate(['/registro']);
      }
    });
  }

  // Método que será llamado cuando el creador inicie una pregunta
  startQuestion(questionIndex: number) {
    if (this.questionnaire && this.questionnaire.questions[questionIndex]) {
      this.currentQuestionIndex = questionIndex;
      this.currentQuestion = this.questionnaire.questions[questionIndex];
      this.isWaiting = false;
      this.showResults = false;
    }
  }

  // Método para mostrar resultados
  showQuestionResults() {
    this.showResults = true;
  }

  // Método para volver a esperar
  backToWaiting() {
    this.isWaiting = true;
    this.currentQuestionIndex = -1;
    this.currentQuestion = null;
    this.showResults = false;
  }

  // Método para convertir índice a letra (A, B, C, etc.)
  indexToLetter(index: number): string {
    return String.fromCharCode(65 + index); // 65 es el código ASCII de 'A'
  }
}
