import { AsyncPipe, DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { ListingService } from '../../core/services/listing.service';
import { Listing } from '../../core/models/listing';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DecimalPipe, DatePipe, RouterLink],
  templateUrl: './listing-detail.component.html',
  styleUrl: './listing-detail.component.scss',
})
export class ListingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private listingService = inject(ListingService);

  listing = signal<Listing | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  currentPhotoIndex = signal<number>(0);

  currentUser$ = this.authService.currentUser$;

  ngOnInit(): void {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadListing(parseInt(id, 10));
    }
  }

  loadListing(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.listingService.getListings().subscribe({
      next: (listings) => {
        const listing = listings.find((l) => l.id === id);
        if (listing) {
          this.listing.set(listing);
        } else {
          this.errorMessage.set('Listing not found');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load listing details.');
        this.isLoading.set(false);
      },
    });
  }

  nextPhoto(): void {
    const listing = this.listing();
    if (listing && listing.photos.length > 0) {
      this.currentPhotoIndex.set((this.currentPhotoIndex() + 1) % listing.photos.length);
    }
  }

  previousPhoto(): void {
    const listing = this.listing();
    if (listing && listing.photos.length > 0) {
      const newIndex = this.currentPhotoIndex() - 1;
      this.currentPhotoIndex.set(newIndex < 0 ? listing.photos.length - 1 : newIndex);
    }
  }

  goToPhoto(index: number): void {
    this.currentPhotoIndex.set(index);
  }

  verifyListing(): void {
    const currentUser = this.authService.currentUser;
    const listing = this.listing();

    if (!currentUser || !listing) return;

    if (currentUser.role === 'student') {
      this.errorMessage.set('Only helpers can verify listings.');
      return;
    }

    this.listingService
      .verifyListing(listing.id, currentUser.id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (updatedListing) => {
          this.listing.set(updatedListing);
          this.errorMessage.set(null);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.error ?? 'Unable to verify listing.');
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/listings']);
  }
}

