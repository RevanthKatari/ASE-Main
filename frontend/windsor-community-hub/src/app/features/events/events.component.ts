import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
})
export class EventsComponent implements OnInit {
  private authService = inject(AuthService);
  private eventService = inject(EventService);
  private fb = inject(FormBuilder);

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

  ngOnInit(): void {
    this.loadEvents();
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
        },
        error: (error) => {
          this.feedbackMessage.set(error?.error?.error ?? 'Unable to publish event.');
        },
      });
  }
}

