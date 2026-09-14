import { Component } from '@angular/core';
import { io, Socket } from 'socket.io-client';

interface Message {
  type: 'ai' | 'user';
  text?: string;
  image?: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  styleUrl: './chat.component.css',
  template: `
    <div class="chat-screen">
      <div class="icon-sidebar">
        <button class="icon-btn">&lsaquo;</button>
        <button class="icon-btn plus">+</button>
        <button class="icon-btn active">&#128172;</button>
        <button class="icon-btn">&#11088;</button>
        <button class="icon-btn">&#128197;</button>
        <button class="icon-btn">&#128196;</button>
        <div class="spacer"></div>
        <button class="icon-btn">&#9881;</button>
        <div class="user-avatar">M</div>
      </div>

      <div class="chat-list">
        <h2>Chat results</h2>
        <div class="group">
          <h3>Today</h3>
          <div class="chat-card active">
            <div class="tag">&#128444; Image Generation</div>
            <div class="date">Today, 05th August 2025</div>
            <div class="preview-img">
              <img src="https://th.bing.com/th/id/OIP.VkjM-ji1a1BdARjD_QVvlAHaHa?w=187&h=187&c=7&r=0&o=7&pid=1.7&rm=3" />
            </div>
            <div class="tag small">&#128444; Butterfly images</div>
            <div class="sub">Purple butterfly on a light background</div>
          </div>
        </div>
        <div class="group">
          <h3>Yesterday</h3>
          <div class="chat-card">
            <div class="tag">&#128269; AI Search</div>
            <div class="date">Yesterday, 04th August 2025</div>
            <div class="q-item">
              <span class="q-ic">&#128338;</span>
              <div><b>How to increase user retention?</b><br><small>Focus on onboarding, personalized...</small></div>
            </div>
            <div class="q-item">
              <span class="q-ic">&#128300;</span>
              <div><b>How to reduce churn rate?</b><br><small>Identify at-risk users through data...</small></div>
            </div>
            <div class="q-item">
              <span class="q-ic">&#128640;</span>
              <div><b>How to improve product adoption?</b><br><small>Simplify onboarding, offer in-app...</small></div>
            </div>
            <div class="q-item">
              <span class="q-ic">&#128722;</span>
              <div><b>How to increase repeat purchases?</b><br><small>Use personalized recommendations...</small></div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-main">
        <div class="chat-header">
          <div class="left-s">
            <button class="icon-btn">&#128444;</button>
            <h2>New Chat</h2>
          </div>
          <button class="icon-btn close">&times;</button>
        </div>

        @for (m of messages; track $index) {
          @if (m.type === 'ai') {
            <div class="msg ai">
              <div class="avtr">&#128105;</div>
              @if ($index === 0) {
                <div class="text"><h3>Hi,<br>How can I help you?</h3></div>
              }
              @else {
                <div class="bubble-ai" [innerHTML]="m.text"></div>
              }
            </div>
          }
          @else {
            <div class="msg user">
              @if (m.image) {
                <div class="bubble"><img [src]="m.image" class="send-img" /></div>
              }
              @else {
                <div class="bubble" [innerHTML]="m.text"></div>
              }
            </div>
          }
        }

        <div class="chips-row">
          <div class="chip">
            <div class="chip-icon">&#128193;</div>
            <div><b>Chat Files</b></div>
          </div>
          <div class="chip">
            <div class="chip-icon">&#128444;</div>
            <div><b>Images</b></div>
          </div>
          <div class="chip">
            <div class="chip-icon">&#127760;</div>
            <div><b>Translate</b></div>
          </div>
          <div class="chip">
            <div class="chip-icon">&#127909;</div>
            <div><b>Audio Chat</b></div>
          </div>
        </div>

        <div class="input-row">
          <input #box type="text" placeholder="Ask me anything........"
            (keyup.enter)="sendMsg(box.value); box.value = ''" />
          <button class="act-btn">&#127908;</button>

          <input #fileBtn type="file" accept="image/*" style="display:none"
            (change)="uploadFile($event)" />
          <button class="act-btn" (click)="fileBtn.click()">&#128206;</button>

          <button class="act-btn plus">+</button>
          <button class="send" (click)="sendMsg(box.value); box.value = ''">&#10148;</button>
        </div>

        <div class="side-icons">
          <button class="icon-btn">&#9745;</button>
          <button class="icon-btn">&#11036;</button>
          <button class="icon-btn">&#8943;</button>
        </div>
      </div>
    </div>
  `
})
export class ChatComponent {
  socket: Socket = io('https://ICE-Angular-Demo.onrender.com');

  messages: Message[] = [
    { type: 'ai' },
    {
      type: 'user',
      text: `Imagine that I'm the manager of a product development team. List the <b>main risks</b> associated with <b>launching a new product</b>`
    },
    {
      type: 'ai',
      text: `<p><b>1. Misalignment with Market Needs:</b> The product might not meet the actual needs or desires of the target audience. Extensive market research is critical, but even then, trends can change quickly.</p><p><b>2. Misalignment with Market Needs:</b> The product might not meet the actual needs or desires of the target audience. Extensive market research is critical, but even then, trends can change quickly.</p>`
    }
  ];

  constructor() {
    this.socket.on('chat message', (m: any) => {
      if (m.kind === 'text') {
        this.messages.push({ type: 'ai', text: m.val });
      } else {
        this.messages.push({ type: 'ai', image: m.val });
      }
    });
  }

  sendMsg(val: string) {
    if (!val.trim()) return;
    this.messages.push({ type: 'user', text: val });
    this.socket.emit('chat message', { kind: 'text', val });
  }

  uploadFile(e: any) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.messages.push({ type: 'user', image: dataUrl });
      this.socket.emit('chat message', { kind: 'image', val: dataUrl });
    };
    reader.readAsDataURL(file);
  }
}
