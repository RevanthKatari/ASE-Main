import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { ListingService } from './listing.service';
import { EventService } from './event.service';
import { Listing } from '../models/listing';
import { CommunityEvent } from '../models/event';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private listingService = inject(ListingService);
  private eventService = inject(EventService);

  private listings: Listing[] = [];
  private events: CommunityEvent[] = [];

  constructor() {
    // Load data on init
    this.loadData();
  }

  private loadData(): void {
    forkJoin({
      listings: this.listingService.getListings(),
      events: this.eventService.getEvents(),
    }).subscribe({
      next: (data) => {
        this.listings = data.listings;
        this.events = data.events;
      },
    });
  }

  processMessage(userMessage: string): Observable<string> {
    const message = userMessage.toLowerCase().trim();

    // Security filter - block sensitive queries
    if (this.isSensitiveQuery(message)) {
      return of(
        "I'm here to help you find housing and events in Windsor. I can't provide information about system internals, code, or security details. How can I help you with housing or community events?"
      );
    }

    // Detect intent and respond
    if (this.matchesIntent(message, ['hello', 'hi', 'hey', 'greetings'])) {
      return of(this.getGreeting());
    }

    if (this.matchesIntent(message, ['help', 'what can you do', 'commands'])) {
      return of(this.getHelpMessage());
    }

    if (this.matchesIntent(message, ['price', 'cost', 'rent', 'cheap', 'affordable', 'budget'])) {
      return of(this.handlePriceQuery(message));
    }

    if (this.matchesIntent(message, ['room', 'listing', 'apartment', 'house', 'housing', 'accommodation'])) {
      return of(this.handleListingQuery(message));
    }

    if (this.matchesIntent(message, ['event', 'activity', 'meetup', 'gathering', 'workshop'])) {
      return of(this.handleEventQuery(message));
    }

    if (this.matchesIntent(message, ['verified', 'trusted', 'safe', 'legitimate'])) {
      return of(this.handleVerifiedQuery());
    }

    if (this.matchesIntent(message, ['location', 'area', 'downtown', 'university', 'campus'])) {
      return of(this.handleLocationQuery(message));
    }

    if (this.matchesIntent(message, ['available', 'how many', 'total', 'count'])) {
      return of(this.handleCountQuery(message));
    }

    // Default response
    return of(this.getDefaultResponse());
  }

  private isSensitiveQuery(message: string): boolean {
    const sensitiveKeywords = [
      'password',
      'token',
      'api',
      'key',
      'secret',
      'database',
      'sql',
      'code',
      'admin',
      'config',
      'server',
      'backend',
      'exploit',
      'hack',
      'security',
      'vulnerability',
    ];
    return sensitiveKeywords.some((keyword) => message.includes(keyword));
  }

  private matchesIntent(message: string, keywords: string[]): boolean {
    return keywords.some((keyword) => message.includes(keyword));
  }

  private getGreeting(): string {
    const greetings = [
      "Hi there! 👋 I'm your Windsor Community Hub assistant. I can help you find housing and events. What are you looking for?",
      "Hello! 🏠 I'm here to help you discover housing and community events in Windsor. How can I assist you?",
      "Hey! 😊 Looking for a place to stay or events to attend? I'm here to help!",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private getHelpMessage(): string {
    return `I can help you with:

🏠 **Housing:**
- Find rooms by price (e.g., "rooms under $700")
- Search by location (e.g., "listings near downtown")
- Show verified listings

📅 **Events:**
- Upcoming community events
- Events by location
- Event details

💡 **Try asking:**
- "What rooms are available under $800?"
- "Show me verified listings"
- "What events are coming up?"
- "Housing near university"

What would you like to know?`;
  }

  private handlePriceQuery(message: string): string {
    // Extract price from message
    const priceMatch = message.match(/(\d+)/);
    const maxPrice = priceMatch ? parseInt(priceMatch[1]) : 1000;

    const affordableListings = this.listings.filter((l) => l.price <= maxPrice);

    if (affordableListings.length === 0) {
      return `I couldn't find any listings under $${maxPrice}. The lowest priced listing we have is $${Math.min(
        ...this.listings.map((l) => l.price)
      )}. Would you like to see all available options?`;
    }

    const verifiedCount = affordableListings.filter((l) => l.verified).length;

    let response = `Found **${affordableListings.length}** listing${
      affordableListings.length > 1 ? 's' : ''
    } under $${maxPrice}:\n\n`;

    affordableListings.slice(0, 3).forEach((listing) => {
      response += `${listing.verified ? '✅' : '⏳'} **${listing.title}**\n`;
      response += `   💰 $${listing.price}/month\n`;
      response += `   📍 ${listing.location}\n`;
      response += `   ${listing.description.substring(0, 60)}...\n\n`;
    });

    if (affordableListings.length > 3) {
      response += `...and ${affordableListings.length - 3} more! `;
    }

    response += `\n${verifiedCount} of these are verified by community helpers. `;
    response += `Visit the Housing page to see full details and contact information!`;

    return response;
  }

  private handleListingQuery(message: string): string {
    if (this.listings.length === 0) {
      return "There are currently no listings available. Check back soon or create an account to be the first to share a listing!";
    }

    const verifiedListings = this.listings.filter((l) => l.verified);
    
    let response = `We currently have **${this.listings.length}** housing listing${
      this.listings.length > 1 ? 's' : ''
    } available:\n\n`;

    // Show top 3 listings
    this.listings.slice(0, 3).forEach((listing) => {
      response += `${listing.verified ? '✅' : '⏳'} **${listing.title}**\n`;
      response += `   💰 $${listing.price}/month\n`;
      response += `   📍 ${listing.location}\n\n`;
    });

    if (this.listings.length > 3) {
      response += `...and ${this.listings.length - 3} more!\n\n`;
    }

    response += `📊 **${verifiedListings.length}** are verified by community helpers.\n`;
    response += `💵 Price range: $${Math.min(...this.listings.map((l) => l.price))} - $${Math.max(
      ...this.listings.map((l) => l.price)
    )}\n\n`;
    response += `Visit the Housing page to view full details and contact landlords!`;

    return response;
  }

  private handleEventQuery(message: string): string {
    if (this.events.length === 0) {
      return "There are no upcoming events at the moment. Check back soon or sign in to create your own event!";
    }

    const now = new Date();
    const upcomingEvents = this.events.filter((e) => new Date(e.start_time) > now);

    let response = `📅 **${upcomingEvents.length}** upcoming event${
      upcomingEvents.length !== 1 ? 's' : ''
    }:\n\n`;

    upcomingEvents.slice(0, 3).forEach((event) => {
      const eventDate = new Date(event.start_time);
      response += `🎉 **${event.title}**\n`;
      response += `   📍 ${event.location}\n`;
      response += `   🗓️ ${eventDate.toLocaleDateString()}\n`;
      response += `   ${event.description.substring(0, 60)}...\n\n`;
    });

    if (upcomingEvents.length > 3) {
      response += `...and ${upcomingEvents.length - 3} more events!\n\n`;
    }

    response += `Visit the Events page to see full details and RSVP!`;

    return response;
  }

  private handleVerifiedQuery(): string {
    const verifiedListings = this.listings.filter((l) => l.verified);
    const unverifiedListings = this.listings.filter((l) => !l.verified);

    let response = `🛡️ **Verified Listings:**\n\n`;
    response += `✅ **${verifiedListings.length}** verified listing${verifiedListings.length !== 1 ? 's' : ''}\n`;
    response += `⏳ **${unverifiedListings.length}** pending verification\n\n`;

    if (verifiedListings.length > 0) {
      response += `Verified listings have been reviewed by community helpers to ensure safety and accuracy.\n\n`;
      
      verifiedListings.slice(0, 2).forEach((listing) => {
        response += `✅ **${listing.title}** - $${listing.price}/month at ${listing.location}\n`;
      });
      
      if (verifiedListings.length > 2) {
        response += `\n...and ${verifiedListings.length - 2} more verified listings!\n`;
      }
    }

    response += `\nVisit the Housing page to see all verified listings!`;

    return response;
  }

  private handleLocationQuery(message: string): string {
    const locations = [...new Set(this.listings.map((l) => l.location))];
    
    // Try to find specific location match
    const locationKeywords = ['downtown', 'university', 'campus', 'near'];
    const matchedLocation = locations.find((loc) =>
      locationKeywords.some((keyword) => message.includes(keyword) && loc.toLowerCase().includes(keyword))
    );

    if (matchedLocation) {
      const locationListings = this.listings.filter((l) => l.location === matchedLocation);
      
      let response = `📍 Found **${locationListings.length}** listing${
        locationListings.length !== 1 ? 's' : ''
      } in ${matchedLocation}:\n\n`;

      locationListings.forEach((listing) => {
        response += `${listing.verified ? '✅' : '⏳'} **${listing.title}** - $${listing.price}/month\n`;
      });

      response += `\nVisit the Housing page to see full details!`;
      return response;
    }

    // Show all locations
    let response = `📍 **Available Locations:**\n\n`;
    locations.forEach((location) => {
      const count = this.listings.filter((l) => l.location === location).length;
      response += `• ${location} (${count} listing${count !== 1 ? 's' : ''})\n`;
    });
    response += `\nTry asking about a specific area like "downtown" or "near university"!`;

    return response;
  }

  private handleCountQuery(message: string): string {
    const verifiedListings = this.listings.filter((l) => l.verified);
    const upcomingEvents = this.events.filter((e) => new Date(e.start_time) > new Date());

    return `📊 **Current Stats:**

🏠 **Housing:**
• Total listings: ${this.listings.length}
• Verified: ${verifiedListings.length}
• Pending: ${this.listings.length - verifiedListings.length}
• Avg price: $${Math.round(this.listings.reduce((sum, l) => sum + l.price, 0) / this.listings.length)}

📅 **Events:**
• Upcoming events: ${upcomingEvents.length}
• Total events: ${this.events.length}

Want to know more about housing or events? Just ask! 😊`;
  }

  private getDefaultResponse(): string {
    return `I'm here to help you find housing and events in Windsor! 

Try asking me:
• "What rooms are available?"
• "Show me listings under $700"
• "What events are coming up?"
• "Housing near downtown"

What would you like to know? 😊`;
  }
}

