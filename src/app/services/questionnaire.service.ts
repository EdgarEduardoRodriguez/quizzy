import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {
  private apiUrl = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) { }

  // Headers con JWT token
  private getHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
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
}
