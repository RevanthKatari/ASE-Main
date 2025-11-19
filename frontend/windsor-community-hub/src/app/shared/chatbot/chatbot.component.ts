import { NgFor, NgIf, DatePipe } from '@angular/common';
import { Component, signal, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ChatbotService, ChatMessage } from '../../core/services/chatbot.service';
import { FormatChatMessagePipe } from './format-chat-message.pipe';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DatePipe, FormatChatMessagePipe],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef;

  private chatbotService = inject(ChatbotService);

  isOpen = signal(false);
  messages = signal<ChatMessage[]>([]);
  userInput = signal('');
  isTyping = signal(false);
  private shouldScroll = false;

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  toggleChat(): void {
    this.isOpen.set(!this.isOpen());
    
    // Show welcome message on first open
    if (this.isOpen() && this.messages().length === 0) {
      this.addBotMessage(
        "Hi! 👋 I'm your Windsor Community Hub assistant. I can help you find housing and events. What are you looking for?"
      );
    }
  }

  sendMessage(): void {
    const text = this.userInput().trim();
    if (!text) return;

    // Add user message
    this.addUserMessage(text);
    this.userInput.set('');

    // Show typing indicator
    this.isTyping.set(true);

    // Get bot response
    setTimeout(() => {
      this.chatbotService.processMessage(text).subscribe({
        next: (response) => {
          this.isTyping.set(false);
          this.addBotMessage(response);
        },
        error: () => {
          this.isTyping.set(false);
          this.addBotMessage("Sorry, I encountered an error. Please try again!");
        },
      });
    }, 500); // Simulate thinking time
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private addUserMessage(text: string): void {
    const message: ChatMessage = {
      id: this.generateId(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    this.messages.update((msgs) => [...msgs, message]);
    this.shouldScroll = true;
  }

  private addBotMessage(text: string): void {
    const message: ChatMessage = {
      id: this.generateId(),
      text,
      sender: 'bot',
      timestamp: new Date(),
    };
    this.messages.update((msgs) => [...msgs, message]);
    this.shouldScroll = true;
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  clearChat(): void {
    this.messages.set([]);
    this.addBotMessage(
      "Chat cleared! How can I help you find housing or events in Windsor?"
    );
  }
}

