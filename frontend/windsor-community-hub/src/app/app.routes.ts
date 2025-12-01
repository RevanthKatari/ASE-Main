import { Routes } from '@angular/router';

import { DashboardComponent } from './features/dashboard/dashboard.component';
import { EventsComponent } from './features/events/events.component';
import { EventDetailComponent } from './features/events/event-detail.component';
import { ListingsComponent } from './features/listings/listings.component';
import { ListingDetailComponent } from './features/listings/listing-detail.component';
import { LoginComponent } from './features/auth/login.component';
import { ModerationComponent } from './features/moderation/moderation.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'listings', component: ListingsComponent },
  { path: 'listings/:id', component: ListingDetailComponent },
  { path: 'events', component: EventsComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'moderation', component: ModerationComponent },
  { path: '**', redirectTo: '' },
];
