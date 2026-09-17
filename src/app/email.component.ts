import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import Quill from 'quill';
 
interface Message {
  sender: string;
  avatar: string;
  time: string;
  to: string;
  text: string;
  isPrivate?: boolean;
}
 
interface Ticket {
  id: string;
  num: string;
  title: string;
  email: string;
  date: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
  project: string;
  tags: string[];
  messages: Message[];
}
 
@Component({
  selector: 'app-email',
  standalone: true,
  template: `
    <div class="capacity-container">
      <!-- 1. LEFT TICKET VIEWS -->
      <aside class="views-panel">
        <div class="views-title">&#9662; TICKET VIEWS</div>
        <div class="view-item" [class.active]="activeView === 'my'" (click)="activeView = 'my'">
          <span>My Tickets</span>
          <span class="count-badge">2</span>
        </div>
        <div class="view-item" [class.active]="activeView === 'high'" (click)="activeView = 'high'">
          <span>High Priority</span>
          <span class="count-badge">1</span>
        </div>
        <div class="view-item" [class.active]="activeView === 'done'" (click)="activeView = 'done'">
          <span>Done</span>
          <span class="count-badge">1</span>
        </div>
        <div class="view-item" [class.active]="activeView === 'all'" (click)="activeView = 'all'">
          <span>All Tickets</span>
          <span class="count-badge">{{ tickets.length }}</span>
        </div>
      </aside>
 
      <!-- 2. TICKETS LIST -->
      <section class="tickets-panel">
        <div class="tickets-header">
          <b>{{ getViewTitle() }}</b>
          <small class="text-muted">{{ filteredTickets.length }} items</small>
        </div>
        <div class="search-wrap">
          <input
            type="text"
            placeholder="Search tickets..."
            [value]="searchQuery"
            (input)="searchQuery = $any($event.target).value"
          />
        </div>
        <div class="ticket-items">
          @for (t of filteredTickets; track t.id) {
            <div class="ticket-row" [class.active-ticket]="t.id === selectedTicket.id" (click)="selectTicket(t)">
              <div class="t-top">
                <span class="t-title">{{ t.title }}</span>
                <span class="t-date">{{ t.date }}</span>
              </div>
              <div class="t-sub">
                <span class="badge-id">{{ t.id }}</span>
                <span class="badge-status" [class.done]="t.status === 'Done'">{{ t.status }}</span>
                <span class="t-assignee">{{ t.assignee.split(' ')[0] }}</span>
              </div>
            </div>
          }
        </div>
      </section>
 
      <!-- 3. CENTER CONVERSATION & QUILL EDITOR -->
      <main class="conversation-panel">
        <!-- Ticket Header -->
        <div class="conv-header">
          <div>
            <h3>{{ selectedTicket.title }}</h3>
            <div class="conv-meta">
              <b>{{ selectedTicket.id }}</b> ({{ selectedTicket.num }}) &bull; To: {{ selectedTicket.email }}
            </div>
          </div>
          <span class="badge-count">&#9993; {{ selectedTicket.messages.length }}</span>
        </div>
 
        <div class="conv-scrollable">
          <!-- Reply Box with Quill -->
          <div class="reply-card">
            <div class="reply-tabs">
              <button [class.tab-active]="replyMode === 'public'" (click)="replyMode = 'public'">Public Reply</button>
              <button [class.tab-active]="replyMode === 'private'" (click)="replyMode = 'private'">Private Note</button>
            </div>
 
            <div class="to-line">
              <span class="to-label">To:</span>
              <span class="to-chip">{{ selectedTicket.email }}</span>
            </div>
 
            <!-- Quill Container -->
            <div class="quill-box">
              <div #editorDiv></div>
            </div>
 
            <div class="reply-actions">
              <label class="kb-check">
                <input type="checkbox" /> Add to KB
              </label>
              <button class="btn-send-reply" (click)="sendReply()">
                Send {{ replyMode === 'public' ? 'Reply' : 'Note' }}
              </button>
            </div>
          </div>
 
          <!-- Thread Messages -->
          <div class="messages-list">
            @for (m of selectedTicket.messages; track m.time + m.sender) {
              <div class="message-card" [class.internal-note]="m.isPrivate">
                <div class="m-header">
                  <img [src]="m.avatar" alt="Avatar" class="m-avatar" />
                  <div class="m-meta">
                    <b>{{ m.sender }}</b>
                    @if (m.isPrivate) { <span class="badge-note">Private Note</span> }
                    <span class="m-time">{{ m.time }}</span>
                  </div>
                </div>
                <div class="m-text">{{ m.text }}</div>
              </div>
            }
          </div>
        </div>
      </main>
 
      <!-- 4. RIGHT PROPERTIES PANEL -->
      <aside class="props-panel">
        <div class="props-head">
          <label>Status</label>
          <select [value]="selectedTicket.status" (change)="selectedTicket.status = $any($event.target).value">
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
 
        <div class="props-content">
          <div class="field-group">
            <label>Priority</label>
            <select [value]="selectedTicket.priority" (change)="selectedTicket.priority = $any($event.target).value">
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
 
          <div class="field-group">
            <div class="field-label-row">
              <label>Assigned To</label>
              <span class="link-assign" (click)="selectedTicket.assignee = 'Allie Harmon'">Me</span>
            </div>
            <select [value]="selectedTicket.assignee" (change)="selectedTicket.assignee = $any($event.target).value">
              <option value="Allie Harmon">Allie Harmon</option>
              <option value="Danny Amacher">Danny Amacher</option>
            </select>
          </div>
 
          <div class="field-group">
            <label>Due Date</label>
            <input type="date" [value]="selectedTicket.dueDate" (change)="selectedTicket.dueDate = $any($event.target).value" />
          </div>
 
          <div class="field-group">
            <label>Project</label>
            <input type="text" [value]="selectedTicket.project" (change)="selectedTicket.project = $any($event.target).value" />
          </div>
 
          <div class="field-group">
            <label>Tags</label>
            <div class="tags-container">
              @for (tag of selectedTicket.tags; track tag; let i = $index) {
                <span class="tag-chip">{{ tag }} <b (click)="removeTag(i)">&times;</b></span>
              }
            </div>
            <div class="add-tag-row">
              <input
                type="text"
                placeholder="New tag..."
                [value]="newTag"
                (input)="newTag = $any($event.target).value"
                (keydown.enter)="addTag()"
              />
              <button (click)="addTag()">Add</button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
      overflow: hidden;
      font-family: 'Lato', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #333;
    }
    .capacity-container {
      display: grid;
      grid-template-columns: 170px 270px 1fr 240px;
      height: 100%;
      width: 100%;
      background: #f4f6f9;
      overflow: hidden;
    }
    /* Views Panel */
    .views-panel {
      background: #ffffff;
      border-right: 1px solid #e0e0e0;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .views-title {
      font-size: 11px;
      font-weight: bold;
      color: #777;
      margin-bottom: 6px;
      padding-left: 6px;
    }
    .view-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 7px 10px;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
      color: #444;
    }
    .view-item:hover { background: #f0f4f8; }
    .view-item.active {
      background: #0077cc;
      color: #fff;
      font-weight: bold;
    }
    .count-badge {
      font-size: 11px;
      background: #e6e6e6;
      padding: 1px 6px;
      border-radius: 10px;
      color: #555;
    }
    .view-item.active .count-badge {
      background: rgba(255,255,255,0.3);
      color: #fff;
    }
    /* Tickets Panel */
    .tickets-panel {
      background: #ffffff;
      border-right: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .tickets-header {
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
    }
    .text-muted { color: #888; font-size: 11px; }
    .search-wrap {
      padding: 8px 10px;
      border-bottom: 1px solid #eee;
    }
    .search-wrap input {
      width: 100%;
      padding: 5px 8px;
      font-size: 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
      outline: none;
    }
    .ticket-items {
      flex: 1;
      overflow-y: auto;
    }
    .ticket-row {
      padding: 10px 12px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
    }
    .ticket-row:hover { background: #f9fbfd; }
    .ticket-row.active-ticket {
      background: #e6f2ff;
      border-left: 3px solid #0077cc;
    }
    .t-top {
      display: flex;
      justify-content: space-between;
      gap: 5px;
    }
    .t-title {
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .t-date { font-size: 11px; color: #888; white-space: nowrap; }
    .t-sub {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 5px;
      font-size: 11px;
    }
    .badge-id { background: #eee; padding: 1px 4px; border-radius: 3px; font-weight: bold; }
    .badge-status {
      background: #e3f2fd;
      color: #0d47a1;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .badge-status.done { background: #e8f5e9; color: #1b5e20; }
    .t-assignee { margin-left: auto; color: #777; }
    /* Conversation Center */
    .conversation-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background: #f8fafc;
    }
    .conv-header {
      background: #fff;
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .conv-header h3 { margin: 0; font-size: 15px; }
    .conv-meta { font-size: 12px; color: #666; margin-top: 2px; }
    .badge-count {
      background: #eef2f6;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      color: #444;
    }
    .conv-scrollable {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    /* Reply Card with Quill */
    .reply-card {
      background: #ffffff;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      padding: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .reply-tabs {
      display: flex;
      gap: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .reply-tabs button {
      background: none;
      border: none;
      font-size: 12px;
      font-weight: bold;
      color: #777;
      cursor: pointer;
      padding: 2px 4px;
    }
    .reply-tabs button.tab-active { color: #0077cc; border-bottom: 2px solid #0077cc; }
    .to-line {
      font-size: 12px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .to-label { color: #777; font-weight: bold; }
    .to-chip {
      background: #f0f4f8;
      border: 1px solid #dce4ec;
      padding: 2px 8px;
      border-radius: 10px;
    }
    .quill-box {
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    :host ::ng-deep .ql-toolbar.ql-snow {
      border: none !important;
      border-bottom: 1px solid #ddd !important;
      background: #f9fbfd;
      padding: 4px 6px !important;
    }
    :host ::ng-deep .ql-container.ql-snow {
      border: none !important;
      min-height: 80px;
      max-height: 140px;
      overflow-y: auto;
      font-family: inherit;
      font-size: 13px;
    }
    .reply-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .kb-check { font-size: 12px; color: #555; cursor: pointer; }
    .btn-send-reply {
      background: #0077cc;
      color: #fff;
      border: none;
      padding: 6px 14px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
    }
    .btn-send-reply:hover { background: #0060a3; }
    /* Messages List */
    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .message-card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 10px 12px;
    }
    .message-card.internal-note {
      background: #fffdf2;
      border-color: #fde68a;
    }
    .m-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .m-avatar {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      object-fit: cover;
    }
    .m-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      flex: 1;
    }
    .badge-note {
      background: #fef3c7;
      color: #b45309;
      font-size: 10px;
      padding: 1px 4px;
      border-radius: 3px;
      font-weight: bold;
    }
    .m-time { margin-left: auto; color: #999; font-size: 11px; }
    .m-text { font-size: 13px; line-height: 1.4; color: #333; }
    /* Props Panel */
    .props-panel {
      background: #ffffff;
      border-left: 1px solid #e0e0e0;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
    }
    .props-head {
      padding: 10px 12px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .props-head label { font-size: 12px; font-weight: bold; }
    .props-head select {
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #0077cc;
      background: #0077cc;
      color: #fff;
      font-weight: bold;
      font-size: 12px;
      cursor: pointer;
    }
    .props-content {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .field-group label {
      font-size: 11px;
      font-weight: bold;
      color: #666;
    }
    .field-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .link-assign {
      font-size: 11px;
      color: #0077cc;
      cursor: pointer;
      font-weight: bold;
    }
    .field-group select, .field-group input {
      padding: 4px 6px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 12px;
      outline: none;
      box-sizing: border-box;
      width: 100%;
    }
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 4px;
    }
    .tag-chip {
      background: #eef2f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      color: #333;
    }
    .tag-chip b {
      cursor: pointer;
      margin-left: 2px;
      color: #888;
    }
    .add-tag-row {
      display: flex;
      gap: 4px;
    }
    .add-tag-row input { flex: 1; }
    .add-tag-row button {
      background: #0077cc;
      color: #fff;
      border: none;
      padding: 2px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
  `]
})
export class EmailComponent implements AfterViewInit {
  @ViewChild('editorDiv') editorDiv!: ElementRef;
  quillEditor: any = null;
 
  activeView = 'my';
  replyMode: 'public' | 'private' = 'public';
  searchQuery = '';
  newTag = '';
 
  tickets: Ticket[] = [
    {
      id: '#21694',
      num: '100669518',
      title: 'Offline survey (Ticket# 21694)',
      email: 'test.1@gmail.com',
      date: 'Jun 2',
      status: 'To Do',
      priority: 'Medium',
      assignee: 'Allie Harmon',
      dueDate: '2025-08-15',
      project: 'Administrative',
      tags: ['Helpdesk', 'Survey'],
      messages: [
        {
          sender: 'Allie Harmon',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
          time: 'Today 10:45 AM',
          to: 'test.1@gmail.com',
          text: 'Hi, I received your survey response. We are checking the data.'
        },
        {
          sender: 'abcde',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
          time: 'Yesterday 04:20 PM',
          to: 'support@enterice.com',
          text: 'Your mail has been acknowledged. Please find the feedback details attached.'
        }
      ]
    },
    {
      id: '#21693',
      num: '100669519',
      title: 'The best employee query',
      email: 'test.2@gmail.com',
      date: 'May 28',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Danny Amacher',
      dueDate: '2025-08-10',
      project: 'Human Resources',
      tags: ['HR', 'Review'],
      messages: [
        {
          sender: 'Danny Amacher',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
          time: 'May 28, 2:30 PM',
          to: 'test.2@gmail.com',
          text: 'Looking forward to your employee review. Meeting scheduled for Friday.'
        }
      ]
    },
    {
      id: '#21691',
      num: '100669520',
      title: 'Reports Issues regarding login',
      email: 'test.3@gmail.com',
      date: 'May 24',
      status: 'Done',
      priority: 'Low',
      assignee: 'Allie Harmon',
      dueDate: '2025-08-01',
      project: 'IT Support',
      tags: ['Login', 'Auth'],
      messages: [
        {
          sender: 'Allie Harmon',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
          time: 'May 24, 09:00 AM',
          to: 'test.3@gmail.com',
          text: 'Unable to login issue resolved. Password reset token dispatched.'
        }
      ]
    }
  ];
 
  selectedTicket: Ticket = this.tickets[0];
 
  ngAfterViewInit() {
    if (this.editorDiv) {
      this.quillEditor = new Quill(this.editorDiv.nativeElement, {
        theme: 'snow',
        placeholder: 'Type your email reply here...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
          ]
        }
      });
    }
  }
 
  get filteredTickets(): Ticket[] {
    let list = this.tickets;
    if (this.activeView === 'my') {
      list = list.filter(t => t.assignee === 'Allie Harmon');
    } else if (this.activeView === 'high') {
      list = list.filter(t => t.priority === 'High');
    } else if (this.activeView === 'done') {
      list = list.filter(t => t.status === 'Done');
    }
 
    if (!this.searchQuery.trim()) return list;
    const q = this.searchQuery.toLowerCase();
    return list.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  }
 
  getViewTitle(): string {
    switch (this.activeView) {
      case 'my': return 'My Tickets';
      case 'high': return 'High Priority';
      case 'done': return 'Done';
      default: return 'All Tickets';
    }
  }
 
  selectTicket(t: Ticket) {
    this.selectedTicket = t;
    if (this.quillEditor) {
      this.quillEditor.setText('');
    }
  }
 
  sendReply() {
    if (!this.quillEditor) return;
    const plainText = this.quillEditor.getText().trim();
    if (!plainText) return;
 
    this.selectedTicket.messages.unshift({
      sender: 'Allie Harmon',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
      time: new Date().toLocaleString(),
      to: this.selectedTicket.email,
      text: plainText,
      isPrivate: this.replyMode === 'private'
    });
 
    this.quillEditor.setText('');
  }
 
  addTag() {
    if (this.newTag.trim()) {
      this.selectedTicket.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }
 
  removeTag(index: number) {
    this.selectedTicket.tags.splice(index, 1);
  }
}