import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { io } from 'socket.io-client';
 
interface ChatMessage {
  time: string;
  sender: string;
  text?: string;        
  isOperator: boolean;
  fileUrl?: string;    
}

interface ChatSession {
  id: string;
  visitorName: string;
  operatorName: string;
  totalTime: string;
  chatTime: string;
  waitTime: string;
  messages: ChatMessage[];
}
 
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  styleUrl: './app.css',
  template: `
    <div class="content-area" style="height: calc(100vh - 70px); overflow: hidden;">
      <div class="chat-container" style="height: 100%; overflow: hidden; display: flex;">
        <div class="left-chat" style="height: 100%; display: flex; flex-direction: column;">
          <div class="left-top" style="background-color: #0f2c4f; display: flex; gap: 10px; align-items: center; padding: 0 10px; text-align: left; height: 40px; flex-shrink: 0;">
            <select style="background: transparent; color: white; border: none; outline: none; cursor: pointer; font-size: 14px;">
              <option value="mychat" style="color: black;">My Chats</option>
              <option value="allchat" style="color: black;">All Chats</option>
            </select>
            <select style="background: transparent; color: white; border: none; outline: none; cursor: pointer; font-size: 14px;">
              <option value="available" style="color: black;">Available</option>
              <option value="notavailable" style="color: black;">Not Available</option>
            </select>
          </div>
          <div class="left-bottom" style="background-color: #ffffff; padding: 0; text-align: left; overflow-y: auto; flex: 1;">
            @for (chat of chats; track chat.id) {
              <div 
                (click)="selectChat(chat)"
                [style.background-color]="selectedChat.id === chat.id ? '#48b5d4' : '#f9f9f9'"
                [style.color]="selectedChat.id === chat.id ? '#000' : '#333'"
                style="padding: 10px; border-bottom: 1px solid #ccc; cursor: pointer; font-size: 13px;">
                
                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px;">
                  <span>JHA</span>
                  <span>Chatting | 🌐</span>
                </div>
                <div style="margin-bottom: 3px;"><b>Operator:</b> {{ chat.operatorName }}</div>
                <div style="margin-bottom: 8px;"><b>Visitor:</b> {{ chat.visitorName }}</div>
                
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11px;">
                  <span>Total Time</span>
                  <span>Chat Time</span>
                  <span>Wait Time</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                  <span>{{ chat.totalTime }}</span>
                  <span>{{ chat.chatTime }}</span>
                  <span>{{ chat.waitTime }}</span>
                </div>
              </div>
            }
          </div>
        </div>
        <div class="middle-chat" style="display: flex; flex-direction: column; height: 100%; overflow: hidden; position: relative; flex: 1;">
          <div style="background: #f1f1f1; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ccc; height: 50px; box-sizing: border-box; flex-shrink: 0;">
            <span style="font-weight: bold; color: #28a745;">✓ {{ selectedChat.visitorName }}</span>
            <div>
              <input #fileBtn type="file" style="display: none" (change)="uploadFile($event)" />
              <button (click)="fileBtn.click()" style="cursor: pointer; background: #ffffff; border: 1px solid #dddddd; border-radius: 4px; padding: 4px 10px; font-size: 14px; font-weight: bold;">
                📎 Attach File
              </button>
            </div>
          </div>
         
          <div #scrollMe class="middle-top" style="display: flex; flex-direction: column; flex: 1; overflow-y: scroll; gap: 10px; padding: 15px; min-height: 0; background-color: #fdfdfd;">
            @for (msg of selectedChat.messages; track $index) {
              <div style="display: flex; align-items: flex-end; gap: 8px; width: 100%; margin-bottom: 5px;" [style.flex-direction]="msg.isOperator ? 'row-reverse' : 'row'">
                <img [src]="msg.isOperator ? 'https://plus.unsplash.com/premium_photo-1739786995646-480d5cfd83dc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww' : 'https://plus.unsplash.com/premium_photo-1739786996060-2769f1ded135?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D'" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 1px solid #ccc; flex-shrink: 0;" alt="User Profile" />
                <div class="message-bubble" [class.op]="msg.isOperator" [class.vi]="!msg.isOperator" style="margin: 0; max-width: 65%; word-break: break-word;">
                  <small class="msg-meta" style="display: block; font-size: 11px; margin-bottom: 3px;">{{ msg.time }} {{ msg.sender }}:</small>
                  @if (msg.text) { <p class="msg-text" style="margin: 0; font-size: 13px; line-height: 1.4;">{{ msg.text }}</p> }
                  @if (msg.fileUrl) {
                    <div class="attachment-box" style="margin-top: 5px;">
                      <img [src]="msg.fileUrl" class="chat-img-preview" alt="Attachment" style="max-width: 100%; max-height: 150px; border-radius: 4px; display: block;" />
                      <a [href]="msg.fileUrl" target="_blank" class="file-link" style="font-size: 12px; color: #0077cc; display: inline-block; margin-top: 3px;">View Full File</a>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
         
          <div class="middle-bottom" style="padding: 10px; background: #fff; border-top: 1px solid #ccc; height: 60px; box-sizing: border-box; flex-shrink: 0; display: flex; align-items: center; gap: 8px;">
            <input #box type="text" (keyup.enter)="sendMsg(box.value); box.value = ''" placeholder="Type your message here..." style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #ccc; outline: none; box-sizing: border-box;" />
            <button (click)="sendMsg(box.value); box.value = ''" style="background: #0077cc; color: white; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px;">
              &#10148;
            </button>
          </div>
        </div>
 
        <div class="right-chat" style="height: 100%; overflow-y: auto;">
          <div class="right-top"><h4>ⓘ Prechat Survey Information</h4></div>
          <div class="right-bottom" style="font-size: 13px;">
            @if (!isFormSubmitted) {
              <div style="display: flex; flex-direction: column; gap: 10px; padding:10px;">
                <p style="font-weight: bold; margin: 0; color: #0077cc; font-size: 14px;">Pre-Chat Survey Form</p>
                @if (errorMessage) { <p style="color: red; font-size: 11px; margin: 0;">{{ errorMessage }}</p> }
                <label>City:<input type="text" [(ngModel)]="city" placeholder="City *" style="width:100%; padding:5px;" /></label>
                <label>Country:<input type="text" [(ngModel)]="country" placeholder="Country *" style="width:100%; padding:5px;" /></label>
                <label>Country code:<input type="text" [(ngModel)]="countryCode" placeholder="Country Code *" style="width:100%; padding:5px;" /></label>
                <label>Region:<input type="text" [(ngModel)]="region" placeholder="Region *" style="width:100%; padding:5px;" /></label>
                <label>Email:<input type="email" [(ngModel)]="email" placeholder="Email Address *" style="width:100%; padding:5px;" /></label>
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
                <button (click)="submitForm()" style="background:#0077cc; color:white; border:none; padding:8px; cursor:pointer; font-weight:bold; border-radius: 4px; margin-top: 5px;">Start Chat</button>
              </div>
            } @else {
              <table style="width: 100%; border-collapse: collapse; color: #333; text-align: left;">
                <tr style="height: 26px; background-color:#dddddd; "><td style="width: 50%; padding: 2px 8px;">Chat ID:</td><td style="font-weight: bold; color: #555;">{{ chatId }}</td></tr>
                <tr style="height: 26px; background-color:#eeeeee;"><td style="padding: 2px 8px;">Email:</td><td style="font-weight: bold; color: #555;">{{ email }}</td></tr>
                <tr style="height: 26px; background-color:#dddddd;"><td style="padding: 2px 8px;">City:</td><td style="font-weight: bold; color: #555;">{{ city }}</td></tr>
                <tr style="height: 26px; background-color:#eeeeee;"><td style="padding: 2px 8px;">Country:</td><td style="font-weight: bold; color: #555;">{{ country }}</td></tr>
                <tr style="height: 26px; background-color:#dddddd;"><td style="padding: 2px 8px;">Country Code:</td><td style="font-weight: bold; color: #555;">{{ countryCode }}</td></tr>
                <tr style="height: 26px; background-color:#eeeeee;"><td style="padding: 2px 8px;">Region:</td><td style="font-weight: bold; color: #555;">{{ region }}</td></tr>
                <tr style="height: 26px; background-color:#dddddd;"><td style="padding: 2px 8px;">Browser:</td><td style="font-weight: bold; color: #555;">{{ browser }}</td></tr>
                <tr style="height: 26px; background-color:#eeeeee;"><td style="padding: 2px 8px;">OS:</td><td style="font-weight: bold; color: #555;">{{ os }}</td></tr>
              </table>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  private socket: any;
 
  isFormSubmitted = false;
  errorMessage = '';
  chatId: number = 0;
  email = ''; city = ''; country = ''; countryCode = ''; region = ''; browser = ''; os = '';
  termsAccepted = false;
 
  chats: ChatSession[] = [
    {
      id: '1', visitorName: 'Visitor4612', operatorName: 'Michael', totalTime: '00:02:09', chatTime: '00:01:57', waitTime: '00:00:05',
      messages: [
        { time: '[07:53]', sender: 'Michael', text: 'Hello, how may I help you today?', isOperator: true },
        { time: '[07:54]', sender: 'Visitor4612', text: 'Please help me', isOperator: false },
        { time: '[07:55]', sender: 'Michael', text: 'What is the problem?', isOperator: true }
      ]
    },
    {
      id: '2', visitorName: 'Visitor5908', operatorName: 'mani', totalTime: '01:04:23', chatTime: '00:41:26', waitTime: '00:00:04',
      messages: [
        { time: '[10:15]', sender: 'mani', text: 'Hi, welcome to support.', isOperator: true },
        { time: '[10:16]', sender: 'Visitor5908', text: 'I have a billing issue.', isOperator: false }
      ]
    },
    {
      id: '3', visitorName: 'Visitor9999', operatorName: 'Sarah', totalTime: '00:05:00', chatTime: '00:04:00', waitTime: '00:01:00',
      messages: [
        { time: '[11:00]', sender: 'Sarah', text: 'Good morning!', isOperator: true }
      ]
    }
  ];

  selectedChat: ChatSession = this.chats[0];
 
  constructor(private cdr: ChangeDetectorRef) {}
 
  ngOnInit() {
    this.socket = io('https://ICE-Angular-Demo.onrender.com');
 
    this.socket.on('chat message', (incomingMsg: any) => {
      this.selectedChat.messages.push({
        time: incomingMsg.time,
        sender: incomingMsg.sender,
        text: incomingMsg.text,
        fileUrl: incomingMsg.fileUrl,
        isOperator: false
      });
      this.cdr.detectChanges();
      this.scrollToBottom();
    });
  }

  selectChat(chat: ChatSession) {
    this.selectedChat = chat;
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      } catch(err) { }
    }, 10);
  }
 
  submitForm() {
    if (!this.email.trim() || !this.city.trim() || !this.country.trim() || !this.countryCode.trim() ||  !this.region.trim() || !this.browser || !this.os) {
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
 
    const timeString = `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]`;
   
    const newMsg: ChatMessage = {
      time: timeString,
      sender: this.selectedChat.operatorName,
      text: textVal,
      isOperator: true
    };
 
    this.selectedChat.messages.push(newMsg);
    this.socket.emit('chat message', newMsg);
    this.cdr.detectChanges();
    this.scrollToBottom();
  }
 
  uploadFile(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
     
      reader.onload = () => {
        const timeString = `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]`;
       
        const fileMsg: ChatMessage = {
          time: timeString,
          sender: this.selectedChat.operatorName,
          isOperator: true,
          fileUrl: reader.result as string
        };
 
        this.selectedChat.messages.push(fileMsg);
 
        this.socket.emit('chat message', fileMsg);
 
        this.cdr.detectChanges();
        this.scrollToBottom();
      };
 
      reader.readAsDataURL(file);
    }
  }
 
  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}