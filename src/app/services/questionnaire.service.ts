import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {
  private apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) { }

  getQuestionnaires(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}questionnaires/`);
  }

  createQuestionnaire(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}questionnaires/create_full/`, data);
  }

  deleteQuestionnaire(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}questionnaires/${id}/`);
  }

  getQuestionnaire(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}questionnaires/${id}/`);
  }

  addQuestionToQuestionnaire(questionnaireId: number, questionData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}questionnaires/${questionnaireId}/add_question/`, questionData);
  }

  deleteQuestionFromQuestionnaire(questionnaireId: number, questionId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}questionnaires/${questionnaireId}/delete_question/?question_id=${questionId}`);
  }

  updateQuestionInQuestionnaire(questionnaireId: number, questionId: number, questionData: any): Observable<any> {
    // Incluir el question_id en los datos de la solicitud para actualizar
    const dataWithId = { ...questionData, question_id: questionId };
    return this.http.post<any>(`${this.apiUrl}questionnaires/${questionnaireId}/add_question/`, dataWithId);
  }
}
