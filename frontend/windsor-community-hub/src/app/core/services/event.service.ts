import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CommunityEvent } from '../models/event';

export interface CreateEventPayload {
  title: string;
  description: string;
  start_time: string;
  location: string;
  iframe_url?: string;
  created_by_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly baseUrl = `${environment.apiBaseUrl}/events`;

  constructor(private http: HttpClient) {}

  getEvents(): Observable<CommunityEvent[]> {
    return this.http.get<CommunityEvent[]>(`${this.baseUrl}/`);
  }

  createEvent(payload: CreateEventPayload): Observable<CommunityEvent> {
    return this.http.post<CommunityEvent>(`${this.baseUrl}/`, payload);
  }
}

