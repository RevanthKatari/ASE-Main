import { AsyncPipe, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, AfterViewInit, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ListingService } from '../../core/services/listing.service';
import { Listing } from '../../core/models/listing';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DecimalPipe, DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './listings.component.html',
  styleUrl: './listings.component.scss',
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
export class ListingsComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private listingService = inject(ListingService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  listings = signal<Listing[]>([]);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  creationMessage = signal<string | null>(null);

  currentUser$ = this.authService.currentUser$;

  form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    location: ['', Validators.required],
    contact: ['', Validators.required],
  });

  uploadedPhotos = signal<string[]>([]);
  isUploadingPhoto = signal<boolean>(false);
  showCreateForm = signal<boolean>(false);

  ngOnInit(): void {
    this.loadListings();
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
          const element = document.getElementById('create-listing');
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
        const element = document.getElementById('create-listing');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }

  loadListings(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.listingService.getListings().subscribe({
      next: (listings) => {
        this.listings.set(listings);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load housing listings.');
        this.isLoading.set(false);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.creationMessage.set('Photo must be less than 5MB');
      return;
    }

    this.isUploadingPhoto.set(true);
    this.creationMessage.set(null);

    this.listingService
      .uploadPhoto(file)
      .pipe(finalize(() => this.isUploadingPhoto.set(false)))
      .subscribe({
        next: (response) => {
          // Backend returns relative URL like "/uploads/filename.jpg"
          // Construct full URL using backend base URL (without /api)
          const backendBase = environment.apiBaseUrl.replace('/api', '');
          const photoUrl = response.url.startsWith('http') 
            ? response.url 
            : `${backendBase}${response.url}`;
          this.uploadedPhotos.update((photos) => [...photos, photoUrl]);
          this.creationMessage.set('Photo uploaded successfully!');
          input.value = ''; // Reset input
        },
        error: (error) => {
          this.creationMessage.set(error?.error?.error ?? 'Unable to upload photo.');
        },
      });
  }

  removePhoto(index: number): void {
    this.uploadedPhotos.update((photos) => photos.filter((_, i) => i !== index));
  }

  submit(): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      this.creationMessage.set('Please sign in to publish a listing.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.creationMessage.set(null);

    const payload = {
      ...this.form.getRawValue(),
      price: Number(this.form.value.price),
      photos: this.uploadedPhotos(),
      owner_id: currentUser.id,
      verified: currentUser.role !== 'student',
    };

    this.listingService
      .createListing(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (listing) => {
          this.form.reset();
          this.uploadedPhotos.set([]);
          this.creationMessage.set('Listing submitted for review.');
          this.listings.update((items) => [listing, ...items]);
          this.showCreateForm.set(false);
        },
        error: (error) => {
          this.creationMessage.set(error?.error?.error ?? 'Unable to create listing.');
        },
      });
  }

  canDeleteListing(listing: Listing, currentUser: any): boolean {
    if (!currentUser) return false;
    // Owner can delete their own listing, helpers can delete any listing
    return listing.owner.id === currentUser.id || currentUser.role !== 'student';
  }

  deleteListing(listing: Listing, event: Event): void {
    event.stopPropagation(); // Prevent navigation to detail page
    
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      this.errorMessage.set('Please sign in to delete listings.');
      return;
    }

    if (!this.canDeleteListing(listing, currentUser)) {
      this.errorMessage.set('You can only delete your own listings.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${listing.title}"? This action cannot be undone.`)) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.listingService
      .deleteListing(listing.id, currentUser.id)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.listings.update((items) => items.filter((item) => item.id !== listing.id));
          this.creationMessage.set('Listing deleted successfully.');
          setTimeout(() => this.creationMessage.set(null), 3000);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.error ?? 'Unable to delete listing.');
        },
      });
  }
}

