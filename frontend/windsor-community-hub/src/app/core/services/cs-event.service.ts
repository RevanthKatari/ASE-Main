import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CSEvent } from '../models/cs-event';

export interface ScrapeResponse {
  message: string;
  added: number;
  updated: number;
  total: number;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class CSEventService {
  private readonly baseUrl = `${environment.apiBaseUrl}/cs-events`;

  constructor(private http: HttpClient) {}

  getCSEvents(): Observable<CSEvent[]> {
    return this.http.get<CSEvent[]>(`${this.baseUrl}/`);
  }

  getCSEvent(id: number): Observable<CSEvent> {
    return this.http.get<CSEvent>(`${this.baseUrl}/${id}`);
  }

  scrapeCSEvents(): Observable<ScrapeResponse> {
    return this.http.post<ScrapeResponse>(`${this.baseUrl}/scrape`, {});
  }
}

