import { AsyncPipe, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ListingService } from '../../core/services/listing.service';
import { Listing } from '../../core/models/listing';

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DecimalPipe, DatePipe],
  templateUrl: './moderation.component.html',
  styleUrl: './moderation.component.scss',
})
export class ModerationComponent implements OnInit {
  private authService = inject(AuthService);
  private listingService = inject(ListingService);

  allListings = signal<Listing[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  currentUser$ = this.authService.currentUser$;

  ngOnInit(): void {
    this.loadListings();
  }

  get unverifiedListings(): Listing[] {
    return this.allListings().filter((l) => !l.verified);
  }

  get verifiedListings(): Listing[] {
    return this.allListings().filter((l) => l.verified);
  }

  loadListings(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.listingService.getListings().subscribe({
      next: (listings) => {
        this.allListings.set(listings);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load listings.');
        this.isLoading.set(false);
      },
    });
  }

  verifyListing(listing: Listing): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      this.errorMessage.set('Please sign in to verify listings.');
      return;
    }

    if (currentUser.role === 'student') {
      this.errorMessage.set('Only helpers can verify listings.');
      return;
    }

    this.listingService
      .verifyListing(listing.id, currentUser.id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (updatedListing) => {
          this.successMessage.set(`Verified "${updatedListing.title}" successfully.`);
          // Update the listing in the array
          this.allListings.update((listings) =>
            listings.map((l) => (l.id === updatedListing.id ? updatedListing : l))
          );
          // Clear success message after 3 seconds
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.error ?? 'Unable to verify listing.');
        },
      });
  }
}

