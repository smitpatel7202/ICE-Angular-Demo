import { Component, VERSION } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [RouterOutlet, RouterLink, RouterLinkActive]
})
export class App {
  name = 'Angular ' + VERSION.major;
  showMenu = false;       // Dropdown dikhane/chhupane ke liye
  activeModal = '';       // Kaun sa modal open hai uski string value
  openModal(title: string) {
    this.activeModal = title;
    this.showMenu = false; // Modal khulne par dropdown band ho jaye
  }
}