import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { CommunityEvent } from '../../core/models/event';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, RouterLink],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.scss',
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private eventService = inject(EventService);
  private sanitizer = inject(DomSanitizer);

  event = signal<CommunityEvent | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  safeIframeUrl = signal<SafeResourceUrl | null>(null);

  currentUser$ = this.authService.currentUser$;

  ngOnInit(): void {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(parseInt(id, 10));
    }
  }

  loadEvent(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.eventService.getEvents().subscribe({
      next: (events) => {
        const event = events.find((e) => e.id === id);
        if (event) {
          this.event.set(event);
          // Sanitize iframe URL if present
          if (event.iframe_url) {
            this.safeIframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(event.iframe_url));
          }
        } else {
          this.errorMessage.set('Event not found');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load event details.');
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  getEventStatus(event: CommunityEvent): string {
    const now = new Date();
    const eventDate = new Date(event.start_time);
    
    if (eventDate < now) {
      return 'past';
    } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return 'today';
    } else {
      return 'upcoming';
    }
  }

  getEventStatusLabel(event: CommunityEvent): string {
    const status = this.getEventStatus(event);
    return status === 'past' ? '✓ Past Event' : status === 'today' ? '🔥 Today!' : '📅 Upcoming';
  }

  canDeleteEvent(event: CommunityEvent, currentUser: any): boolean {
    if (!currentUser) return false;
    // Creator can delete their own event, helpers can delete any event
    return event.creator.id === currentUser.id || currentUser.role !== 'student';
  }

  deleteEvent(): void {
    const currentUser = this.authService.currentUser;
    const event = this.event();

    if (!currentUser || !event) {
      this.errorMessage.set('Please sign in to delete events.');
      return;
    }

    if (!this.canDeleteEvent(event, currentUser)) {
      this.errorMessage.set('You can only delete your own events.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${event.title}"? This action cannot be undone.`)) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.eventService
      .deleteEvent(event.id, currentUser.id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/events']);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.error ?? 'Unable to delete event.');
        },
      });
  }
}

