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
}
