import { Component } from '@angular/core';

interface ChatMessage { time: string; sender: string; text: string; isOperator: boolean; }

@Component({
  selector: 'app-chat',
  standalone: true,
  styleUrl: './app.css',
  template: `
    <div class="content-area">
      <div class="filter-area">  
        <select><option value="mychat">My Chats</option><option value="allchat">All Chats</option></select>
        <select><option value="available">Available</option><option value="notavailable">Not Available</option></select>
      </div>
      <div class="chat-container">
        <div class="left-chat">
          <div class="left-top"><h3>My Chats - Available</h3></div>
          <div class="left-bottom">
            <p>Operator: <span>mani</span></p>
            <p>Visitor: <span>Visitor5908</span></p>
            <p>Wait Time: 00:00:06</p>
          </div>
        </div>
        <div class="middle-chat">
          <div class="middle-top">
            @for (msg of chatMessages; track $index) {
              <p [class.op]="msg.isOperator" [class.vi]="!msg.isOperator">{{ msg.time }} {{ msg.sender }}: {{ msg.text }}</p>
            }
          </div>
          <div class="middle-bottom">
            <input #box type="text" (keyup.enter)="sendMsg(box.value); box.value = ''" placeholder="Type Message Here....." />
          </div>
        </div>
        <div class="right-chat">
          <div class="right-top"><h4>Prechat Survey Information</h4></div>
          <div class="right-bottom">
            <p>Chat ID: 43200</p><p>City: Bangalore</p><p>Country: India (IN)</p>
            <p>Browser: Chrome-81</p><p>OS: Windows-8.1</p><p>Customer IP: 27.61.240.254</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChatComponent {
  chatMessages: ChatMessage[] = [
    { time: '[07:53:50]', sender: 'mani', text: 'Hello, how may I help you today?', isOperator: true },
    { time: '[07:57:34]', sender: 'Visitor5908', text: 'Please help me with my account details', isOperator: false },
  ];
  sendMsg(textVal: string) {
    if (!textVal.trim()) return;
    this.chatMessages.push({ time: `[${new Date().toLocaleTimeString()}]`, sender: 'mani', text: textVal, isOperator: true });
  }
}
