import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, AfterViewInit, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { EventService } from '../../core/services/event.service';
import { CommunityEvent } from '../../core/models/event';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class EventsComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private eventService = inject(EventService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  events = signal<CommunityEvent[]>([]);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  feedbackMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  currentUser$ = this.authService.currentUser$;

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    location: ['', Validators.required],
    start_time: ['', Validators.required],
    iframe_url: [''],
  });

  showCreateForm = signal<boolean>(false);

  ngOnInit(): void {
    this.loadEvents();
    // Check if we came from dashboard (fragment = 'create')
    this.route.fragment.subscribe((fragment) => {
      if (fragment === 'create') {
        this.showCreateForm.set(true);
      }
    });
  }

  ngAfterViewInit(): void {
    // Scroll to create form if fragment is 'create'
    this.route.fragment.subscribe((fragment) => {
      if (fragment === 'create') {
        setTimeout(() => {
          const element = document.getElementById('create-event');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            element.focus();
          }
        }, 100);
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm.update(value => !value);
    if (this.showCreateForm()) {
      setTimeout(() => {
        const element = document.getElementById('create-event');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  loadEvents(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events.set(events);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load events at the moment.');
        this.isLoading.set(false);
      },
    });
  }

  submit(): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      this.feedbackMessage.set('Sign in to publish an event.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, location, start_time, iframe_url } = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.feedbackMessage.set(null);

    const isoStartTime = new Date(start_time).toISOString();

    this.eventService
      .createEvent({
        title,
        description,
        location,
        start_time: isoStartTime,
        iframe_url: iframe_url || undefined,
        created_by_id: currentUser.id,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (event) => {
          this.form.reset();
          this.feedbackMessage.set('Event published successfully.');
          this.events.update((items) => [...items, event].sort((a, b) => a.start_time.localeCompare(b.start_time)));
          this.showCreateForm.set(false);
        },
        error: (error) => {
          this.feedbackMessage.set(error?.error?.error ?? 'Unable to publish event.');
        },
      });
  }

  canDeleteEvent(event: CommunityEvent, currentUser: any): boolean {
    if (!currentUser) return false;
    // Creator can delete their own event, helpers can delete any event
    return event.creator.id === currentUser.id || currentUser.role !== 'student';
  }

  deleteEvent(event: CommunityEvent, clickEvent: Event): void {
    clickEvent.stopPropagation(); // Prevent navigation to detail page
    
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
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

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.eventService
      .deleteEvent(event.id, currentUser.id)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.events.update((items) => items.filter((item) => item.id !== event.id));
          this.feedbackMessage.set('Event deleted successfully.');
          setTimeout(() => this.feedbackMessage.set(null), 3000);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.error ?? 'Unable to delete event.');
        },
      });
  }
}

