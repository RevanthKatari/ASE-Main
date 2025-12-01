import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Listing } from '../models/listing';

export interface CreateListingPayload {
  title: string;
  description: string;
  price: number;
  location: string;
  contact: string;
  owner_id: number;
  photos?: string[];
  verified?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ListingService {
  private readonly baseUrl = `${environment.apiBaseUrl}/listings`;

  constructor(private http: HttpClient) {}

  getListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.baseUrl}/`);
  }

  createListing(payload: CreateListingPayload): Observable<Listing> {
    return this.http.post<Listing>(`${this.baseUrl}/`, payload);
  }

  uploadPhoto(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.post<{ url: string }>(`${this.baseUrl}/upload-photo`, formData);
  }

  verifyListing(listingId: number, helperId: number): Observable<Listing> {
    return this.http.patch<Listing>(`${this.baseUrl}/${listingId}/verify`, {
      helper_id: helperId,
    });
  }

  deleteListing(listingId: number, userId: number): Observable<{ message: string }> {
    return this.http.request<{ message: string }>('DELETE', `${this.baseUrl}/${listingId}`, {
      body: { user_id: userId },
    });
  }
}

