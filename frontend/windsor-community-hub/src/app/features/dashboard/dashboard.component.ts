import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, AsyncPipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser$ = this.authService.currentUser$;

  navigateToShareHousing(): void {
    this.router.navigate(['/listings'], { fragment: 'create' });
  }

  navigateToShareEvent(): void {
    this.router.navigate(['/events'], { fragment: 'create' });
  }
}

