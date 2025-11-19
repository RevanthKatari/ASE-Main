import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatChatMessage',
  standalone: true,
})
export class FormatChatMessagePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Convert **bold** to <strong>
    let formatted = value.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    // Convert bullet points
    formatted = formatted.replace(/^• (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    return formatted;
  }
}

