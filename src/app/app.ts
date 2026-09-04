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
}
