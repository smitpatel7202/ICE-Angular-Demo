import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

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

          <!-- TipTap Toolbar -->
          <div class="tiptap-toolbar">
            <button (click)="run('toggleBold')" [class.active-btn]="editor?.isActive('bold')"><b>B</b></button>
            <button (click)="run('toggleItalic')" [class.active-btn]="editor?.isActive('italic')"><i>I</i></button>
            <button (click)="run('toggleStrike')" [class.active-btn]="editor?.isActive('strike')"><s>S</s></button>
            <button (click)="run('toggleBulletList')" [class.active-btn]="editor?.isActive('bulletList')">• List</button>
            <button (click)="run('toggleOrderedList')" [class.active-btn]="editor?.isActive('orderedList')">1. List</button>
            <button (click)="run('toggleBlockquote')" [class.active-btn]="editor?.isActive('blockquote')">❝ Quote</button>
            <button (click)="run('undo')">↩ Undo</button>
            <button (click)="run('redo')">↪ Redo</button>
          </div>

          <!-- TipTap Editor Container -->
          <div #editorDiv class="tiptap-editor"></div>

          <button class="btn-send">Send Email</button>
        </div>
      </div>
    </div>
  `
})
export class EmailComponent implements AfterViewInit {
  @ViewChild('editorDiv') editorDiv!: ElementRef;
  editor: Editor | null = null;

  inboxMails: InboxMail[] = [
    { id: '#21694', title: 'Offline survey (Ticket# 21694)', email: 'robin.seana01@gmail.com', msg: 'Your mail has been acknowledged.' },
    { id: '#21693', title: 'The best employee query', email: 'john.doe@gmail.com', msg: 'Looking forward to your employee review.' },
    { id: '#21691', title: 'Reports Issues regarding login', email: 'alex.smith@gmail.com', msg: 'Unable to login to the system since morning.' },
  ];
  selectedMail: InboxMail = this.inboxMails[0];

  ngAfterViewInit() {
    this.editor = new Editor({
      element: this.editorDiv.nativeElement,
      extensions: [StarterKit, Placeholder.configure({ placeholder: 'Type your email reply here...' })],
      content: `<p>${this.selectedMail.msg}</p>`,
    });
  }

  selectMail(mail: InboxMail) {
    this.selectedMail = mail;
    this.editor?.commands.setContent(`<p>${mail.msg}</p>`);
  }

  // Simple helper — calls any TipTap command by name
  run(cmd: string) {
    const chain = this.editor?.chain().focus() as any;
    if (chain && chain[cmd]) chain[cmd]().run();
  }
}

