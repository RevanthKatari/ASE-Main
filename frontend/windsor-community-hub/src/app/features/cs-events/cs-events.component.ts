import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { CSEventService } from '../../core/services/cs-event.service';
import { CSEvent } from '../../core/models/cs-event';

@Component({
  selector: 'app-cs-events',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe],
  templateUrl: './cs-events.component.html',
  styleUrl: './cs-events.component.scss',
})
export class CSEventsComponent implements OnInit {
  private csEventService = inject(CSEventService);

  events = signal<CSEvent[]>([]);
  isLoading = signal<boolean>(true);
  isScraping = signal<boolean>(false);
  feedbackMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.feedbackMessage.set(null);

    this.csEventService.getCSEvents().subscribe({
      next: (events) => {
        this.events.set(events);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load CS events at the moment.');
        this.isLoading.set(false);
      },
    });
  }

  scrapeEvents(): void {
    this.isScraping.set(true);
    this.errorMessage.set(null);
    this.feedbackMessage.set(null);

    this.csEventService
      .scrapeCSEvents()
      .pipe(finalize(() => this.isScraping.set(false)))
      .subscribe({
        next: (response) => {
          this.feedbackMessage.set(
            `Scraping completed: ${response.added} new events added, ${response.updated} events updated.`
          );
          if (response.errors && response.errors.length > 0) {
            console.warn('Scraping errors:', response.errors);
          }
          // Reload events after scraping
          this.loadEvents();
          setTimeout(() => this.feedbackMessage.set(null), 5000);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.error ?? 'Unable to scrape events.');
        },
      });
  }

  formatDateTime(event: CSEvent): string {
    const parts: string[] = [];
    
    if (event.event_date) {
      const date = new Date(event.event_date);
      parts.push(date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    }
    
    if (event.event_time) {
      const [hours, minutes] = event.event_time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'pm' : 'am';
      const displayHour = hour % 12 || 12;
      parts.push(`${displayHour}:${minutes} ${ampm}`);
    }
    
    return parts.join(' at ');
  }

  openEventUrl(url: string | undefined): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}

