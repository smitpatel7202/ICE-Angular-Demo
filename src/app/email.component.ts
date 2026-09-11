import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import Quill from 'quill';
interface InboxMail { id: string; title: string; email: string; msg: string; }
@Component({
  selector: 'app-email',
  standalone: true,
  styleUrl: './app.css',
  template: `
    <div class="content-area email-box">
      <div class="filter-area email-filter">
        <select><option value="all">All Tickets</option><option value="open">Open Tickets</option><option value="closed">Closed Tickets</option></select>
        <select><option value="all">All Priorities</option><option value="high">High</option><option value="normal">Standard</option></select>
      </div>
      <div class="email-workspace">
        <div class="email-left-panel">
          <h3>Inbox ({{ inboxMails.length }})</h3>
          @for (mail of inboxMails; track mail.id) {
            <div class="ticket-item" [class.active-ticket]="mail.id === selectedMail.id" (click)="selectMail(mail)">
              <strong>{{ mail.id }}</strong> - {{ mail.title }}<br /><small>{{ mail.email }}</small>
            </div>
          }
        </div>
        <div class="email-right-panel">
          <h2>{{ selectedMail.title }}</h2>
          <div class="form-group"><label style="width: 30px">To:</label><input type="text" [value]="selectedMail.email" readonly /></div>
          <div class="quill-editor-container">
            <div #editorDiv></div>
          </div>
          <button class="btn-send">Send Email</button>
        </div>
      </div>
    </div>
  `
})
export class EmailComponent implements AfterViewInit {
  @ViewChild('editorDiv') editorDiv!: ElementRef;
  quillEditor: any = null;
  inboxMails: InboxMail[] = [
    { id: '#21694', title: 'Offline survey (Ticket# 21694)', email: 'test.1@gmail.com', msg: 'Your mail has been acknowledged.' },
    { id: '#21693', title: 'The best employee query', email: 'test.2@gmail.com', msg: 'Looking forward to your employee review.' },
    { id: '#21691', title: 'Reports Issues regarding login', email: 'test.3@gmail.com', msg: 'Unable to login to the system since morning.' },
  ];
  selectedMail: InboxMail = this.inboxMails[0];
  ngAfterViewInit() {
    this.quillEditor = new Quill(this.editorDiv.nativeElement, {
      theme: 'snow',
      placeholder: 'Type your email reply here...'
    });
    this.quillEditor.root.innerHTML = this.selectedMail.msg;
  }
  selectMail(mail: InboxMail) {
    this.selectedMail = mail;
    if (this.quillEditor) {
      this.quillEditor.root.innerHTML = mail.msg;
    }
  }
}