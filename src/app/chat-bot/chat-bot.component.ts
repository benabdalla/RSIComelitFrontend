import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { IconDirective } from '@coreui/icons-angular';
import { environment } from '../environment.prod'; // or '../environments/environment' for dev
import { GoogleGenAI } from '@google/genai';

interface Msg {
  sender: 'You' | 'Bot';
  text: string;
}

@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrl: './chat-bot.component.scss',
  standalone: true, // if using standalone
  imports: [CommonModule, FormsModule], // ✅ include FormsModule here
})
export class ChatBotComponent {
  opened = false;
  draft = '';
  messages: Msg[] = [{
    sender: 'Bot',
    text: `👋 Welcome to RSIComelit! I am your assistant.
I can help you create an account, change your profile photo, chat with teams, create posts, and answer any questions about RSI company.
How can I assist you today?`
  }];
  private readonly geminiKey = environment.geminiKey;
  private ai = new GoogleGenAI({ apiKey: this.geminiKey }); // <-- Pass the key here
  @ViewChild('scrollBox') scrollBox!: ElementRef<HTMLDivElement>;

  constructor(private http: HttpClient) {}

  open() {
    this.opened = true;
  }
  close() {
    this.opened = false;
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async send() {
    const text = this.draft.trim();
    if (!text) return;
    this.messages.push({ sender: 'You', text });
    this.draft = '';
    this.scrollDown();

    try {
      const reply = await this.askGemini(text);
      this.messages.push({ sender: 'Bot', text: reply });
    } catch (error) {
      console.error(error);
      this.messages.push({
        sender: 'Bot',
        text: '⚠️ Sorry—there was a problem.',
      });
    }
    this.scrollDown();
  }

  private scrollDown() {
    setTimeout(() => {
      const el = this.scrollBox?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  private async askGemini(prompt: string): Promise<string> {
    // Add context instructions for RSIComelit platform
    const context = `
You are an assistant for the RSIComelit platform.
Guide users to:
- Create a user: tell them to go to "Create User" and fill all fields.
- Create a post: tell them to go to "Create Post", add a description, tags, and optionally a photo.
- Chat: explain how to select a person and send a message.
- Change profile photo: explain how to update their profile photo.
- Answer any company-related questions.
Always give clear, step-by-step instructions for each action.
User question:
`;

    const fullPrompt = context + prompt;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: fullPrompt }] }],
    });

    return response?.candidates?.[0]?.content?.parts?.[0]?.text ?? '(no answer)';
  }
}
