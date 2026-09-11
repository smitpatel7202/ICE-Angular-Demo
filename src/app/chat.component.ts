import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
interface ChatMessage {
  time: string;
  sender: string;
  text?: string;        
  isOperator: boolean;
  senderId?: string;
  fileUrl?: string;    
}
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  styleUrl: './app.css',
  template: `
    <div class="content-area">
      <div class="filter-area">                                                    
        <select>
          <option value="mychat">My Chats</option>
          <option value="allchat">All Chats</option>
        </select>
        <select>
          <option value="available">Available</option>
          <option value="notavailable">Notavailable</option>
        </select>
      </div>
      <div class="chat-container">
        <div class="left-chat">
          <div class="left-top"><h3>My Chats - Available</h3></div>
          <div class="left-bottom">
            <p>Operator: <span>mani</span></p>
            <p>Visitor: <span>Visitor5908</span></p>
            <p>Total Time: <span>01:04:23</span></p>
            <p>Wait Time: <span>00:00:04</span></p>
            <p>Chat Time: <span>00:41:26</span></p>
          </div>
        </div>
        <div class="middle-chat">
          <div style="background: #f1f1f1; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc;">
            <span style="font-weight: bold; color: #28a745;">✓ Visitor5908</span>
            <div>
              <input #fileBtn type="file" style="display: none" (change)="uploadFile($event)" />
              <button (click)="fileBtn.click()" style="cursor: pointer; background: #ffffff; border: 1px solid #cccccc; border-radius: 4px; padding: 4px 10px; font-size: 14px; font-weight: bold;">
                📎 Attach File
              </button>
            </div>
          </div>
          <div class="middle-top" style="display: flex; flex-direction: column; flex: 1;">
            @for (msg of chatMessages; track $index) {
              <div class="message-bubble" [class.op]="msg.isOperator" [class.vi]="!msg.isOperator">
                <small class="msg-meta">{{ msg.time }} {{ msg.sender }}:</small>
                @if (msg.text) { <p class="msg-text">{{ msg.text }}</p> }
                @if (msg.fileUrl) {
                  <div class="attachment-box">
                    <img [src]="msg.fileUrl" class="chat-img-preview" alt="Attachment" />
                    <a [href]="msg.fileUrl" target="_blank" class="file-link">View Full File</a>
                  </div>
                }
              </div>
            }
          </div>
          <div class="middle-bottom" style="padding: 10px; background: #fff;">
            <input #box type="text" (keyup.enter)="sendMsg(box.value); box.value = ''" placeholder="Type your message here..." style="width: 100%; box-sizing: border-box;" />
          </div>
        </div>
        <div class="right-chat" style="overflow-y: auto;">
          <div class="right-top"><h4>ⓘ Prechat Survey Information</h4></div>
          <div class="right-bottom" style="font-size: 13px; padding: 12px;">
            @if (!isFormSubmitted) {
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <p style="font-weight: bold; margin: 0; color: #0077cc; font-size: 14px;">Pre-Chat Survey Form</p>
                @if (errorMessage) {
                  <p style="color: red; font-size: 11px; margin: 0;">{{ errorMessage }}</p>
                }
                <input type="text" [(ngModel)]="city" placeholder="City *" style="width:100%; padding:5px;" />
                <input type="text" [(ngModel)]="country" placeholder="Country *" style="width:100%; padding:5px;" />
                <input type="text" [(ngModel)]="countryCode" placeholder="Country Code *" style="width:100%; padding:5px;" />
                <input type="text" [(ngModel)]="region" placeholder="Region *" style="width:100%; padding:5px;" />
                <input type="email" [(ngModel)]="email" placeholder="Email Address *" style="width:100%; padding:5px;" />
                <div>
                  <label style="font-size: 11px; display:block; margin-bottom: 2px; color: #555;">Select Browser *</label>
                  <select [(ngModel)]="browser" style="width:100%; padding:5px; height: 28px;">
                    <option value="">-- Choose Browser --</option>
                    <option value="Chrome-81">Chrome</option>
                    <option value="Firefox-90">Firefox</option>
                    <option value="Safari-14">Safari</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 11px; display:block; margin-bottom: 2px; color: #555;">Operating System *</label>
                  <div style="display: flex; gap: 10px; font-size: 12px;">
                    <label><input type="radio" name="osGroup" value="Windows-11" [(ngModel)]="os"> Windows</label>
                    <label><input type="radio" name="osGroup" value="MacOS-Ventura" [(ngModel)]="os"> MacOS</label>
                    <label><input type="radio" name="osGroup" value="Linux-Ubuntu" [(ngModel)]="os"> Linux</label>
                  </div>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 5px; font-size: 11px;">
                  <input type="checkbox" [(ngModel)]="termsAccepted" id="termsCheck" />
                  <label for="termsCheck" style="color: #444;">I agree to share my system metrics *</label>
                </div>
                <button (click)="submitForm()" style="background:#0077cc; color:white; border:none; padding:8px; cursor:pointer; font-weight:bold; border-radius: 4px; margin-top: 5px;">
                  Start Chat
                </button>
              </div>
            }
            @else {
              <table style="width: 100%; border-collapse: collapse; color: #333; text-align: left;">
                <tr style="height: 26px;">
                  <td style="width: 50%; padding: 2px 0;">Chat ID:</td>
                  <td style="font-weight: bold; color: #555;">{{ chatId }}</td>
                </tr>
                <tr style="height: 26px;">
                  <td style="padding: 2px 0;">Email:</td>
                  <td style="font-weight: bold; color: #555;">{{ email }}</td>
                </tr>
                <tr style="height: 26px;">
                  <td style="padding: 2px 0;">City:</td>
                  <td style="font-weight: bold; color: #555;">{{ city }}</td>
                </tr>
                <tr style="height: 26px;">
                  <td style="padding: 2px 0;">Country:</td>
                  <td style="font-weight: bold; color: #555;">{{ country }}</td>
                </tr>
                <tr style="height: 26px;">
                  <td style="padding: 2px 0;">Country Code:</td>
                  <td style="font-weight: bold; color: #555;">{{ countryCode }}</td>
                </tr>
                <tr style="height: 26px;">
                  <td style="padding: 2px 0;">Region:</td>
                  <td style="font-weight: bold; color: #555;">{{ region }}</td>
                </tr>
                <tr style="height: 26px;">
                  <td style="padding: 2px 0;">Browser:</td>
                  <td style="font-weight: bold; color: #555;">{{ browser }}</td>
                </tr>
                <tr style="height: 26px;">
                  <td style="padding: 2px 0;">OS:</td>
                  <td style="font-weight: bold; color: #555;">{{ os }}</td>
                </tr>
              </table>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChatComponent implements OnInit, OnDestroy {
  isFormSubmitted = false;
  errorMessage = '';
  chatId: number = 0;
  email = ''; city = ''; country = ''; countryCode = ''; region = ''; browser = ''; os = '';
  termsAccepted = false;
  chatMessages: ChatMessage[] = [
    { time: '[07:53]', sender: 'mani', text: 'Hello, how may I help you today?', isOperator: true, senderId: 'operator' },
    { time: '[07:57]', sender: 'Visitor5908', text: 'Please help me', isOperator: false, senderId: 'visitor' }
  ];
  private socket: Socket | undefined;
  submitForm() {
    if (!this.email.trim() || !this.city.trim() || !this.country.trim() ||
        !this.countryCode.trim() || !this.region.trim() || !this.browser || !this.os) {
      this.errorMessage = 'All fields are required.';
      return;
    }
    if (!this.termsAccepted) {
      this.errorMessage = 'You must agree to share metrics.';
      return;
    }
    if (!this.email.includes('@') || !this.email.includes('.')) {
      this.errorMessage = 'Invalid email address.';
      return;
    }
    this.errorMessage = '';
    this.chatId = Math.floor(10000 + Math.random() * 90000);
    this.isFormSubmitted = true;
  }
  sendMsg(textVal: string) {
    if (!textVal.trim()) return;
    const now = `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]`;
    // show locally as operator
    const localMsg: ChatMessage = { time: now, sender: 'mani', text: textVal, isOperator: true, senderId: this.socket?.id };
    this.chatMessages.push(localMsg);
    const outMsg = { time: now, sender: 'mani', text: textVal, senderId: this.socket?.id };
    if (this.socket) {
      console.log('socket emit -> chat message', outMsg);
      this.socket.emit('chat message', outMsg);
    } else {
      console.warn('socket not connected, cannot emit message');
    }
  }
  uploadFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      const tempUrl = URL.createObjectURL(file);
      const now = `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]`;
      const localMsg: ChatMessage = { time: now, sender: 'mani', isOperator: true, fileUrl: tempUrl, senderId: this.socket?.id };
      this.chatMessages.push(localMsg);
      const outMsg = { time: now, sender: 'mani', fileUrl: tempUrl, senderId: this.socket?.id };
      if (this.socket) {
        console.log('socket emit -> chat message (file)', outMsg);
        this.socket.emit('chat message', outMsg);
      } else {
        console.warn('socket not connected, cannot emit file message');
      }
    }
  }

  ngOnInit(): void {
    try {
      this.socket = io('http://localhost:3000');
      this.socket.on('connect', () => {
        console.log('connected to socket server', this.socket?.id);
        try { (window as any).__chatSocket = this.socket; (window as any).__chatSocketId = this.socket?.id; } catch(e){}
      });
      this.socket.on('chat message', (msg: any) => {
        const isOp = msg.senderId && this.socket ? msg.senderId === this.socket.id : false;
        const displayMsg: ChatMessage = {
          time: msg.time || `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]`,
          sender: msg.sender || 'unknown',
          text: msg.text,
          fileUrl: msg.fileUrl,
          isOperator: isOp,
          senderId: msg.senderId
        };
        this.chatMessages.push(displayMsg);
      });
    } catch (err) {
      console.warn('Socket.IO not available', err);
    }
  }

  ngOnDestroy(): void {
    try {
      this.socket?.disconnect();
    } catch (err) {
      // ignore
    }
  }
}