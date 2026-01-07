import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {
  private apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) { }

  // Headers
  private getHeaders() {
    return {
      'Content-Type': 'application/json'
    };
  }

  // Métodos básicos para cuestionarios
  getQuestionnaires(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}questionnaires/`, { headers: this.getHeaders() });
  }

  createQuestionnaire(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}questionnaires/create_full/`, data, { headers: this.getHeaders() });
  }

  deleteQuestionnaire(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}questionnaires/${id}/`, { headers: this.getHeaders() });
  }

  getQuestionnaire(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}questionnaires/${id}/`, { headers: this.getHeaders() });
  }

  addQuestionToQuestionnaire(questionnaireId: number, questionData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}questionnaires/${questionnaireId}/add_question/`, questionData, { headers: this.getHeaders() });
  }

  deleteQuestionFromQuestionnaire(questionnaireId: number, questionId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}questionnaires/${questionnaireId}/delete_question/?question_id=${questionId}`, { headers: this.getHeaders() });
  }

  updateQuestionInQuestionnaire(questionnaireId: number, questionId: number, questionData: any): Observable<any> {
    const dataWithId = { ...questionData, question_id: questionId };
    return this.http.post<any>(`${this.apiUrl}questionnaires/${questionnaireId}/add_question/`, dataWithId, { headers: this.getHeaders() });
  }

  addCuestionarioToQuestionnaire(questionnaireId: number, name: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}questionnaires/${questionnaireId}/add_cuestionario/`, { name }, { headers: this.getHeaders() });
  }

  updateCuestionario(questionnaireId: number, cuestionarioId: number, name: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}questionnaires/${questionnaireId}/update_cuestionario/`, { cuestionario_id: cuestionarioId, name }, { headers: this.getHeaders() });
  }

  deleteCuestionario(questionnaireId: number, cuestionarioId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}questionnaires/${questionnaireId}/delete_cuestionario/?cuestionario_id=${cuestionarioId}`, { headers: this.getHeaders() });
  }

  getCuestionarioQuestions(questionnaireId: number, cuestionarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}questionnaires/${questionnaireId}/get_cuestionario_questions/?cuestionario_id=${cuestionarioId}`, { headers: this.getHeaders() });
  }

  // Método para acceder a un cuestionario por código (para invitados)
  accessQuestionnaireByCode(code: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}quiz/${code}/`, { headers: this.getHeaders() });
  }
}
