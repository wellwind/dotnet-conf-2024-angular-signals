import { Component, signal } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatListItem, MatNavList } from '@angular/material/list';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { menuLinks } from './menu-links';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbar,
    MatIconButton,
    MatIcon,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatNavList,
    MatListItem,
  ],
  template: `
    <mat-toolbar>
      <button mat-icon-button (click)="menuOpened.set(!menuOpened())">
        <mat-icon>menu</mat-icon>
      </button>
      <span>Angular Signals Demo</span>
    </mat-toolbar>

    <mat-sidenav-container>
      <mat-sidenav mode="side" [opened]="menuOpened()">
        <mat-nav-list>
          @for (item of menu(); track item) {
            <a mat-list-item [routerLink]="item.path">{{ item.title }}</a>
          }
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <router-outlet></router-outlet>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    [mat-icon-button] {
      color: #005cbb;
    }
    .mat-toolbar {
      background: #d7e3ff;
      color: #005cbb;
    }

    .mat-sidenav-container {
      height: calc(100vh - 64px);
    }

    .mat-sidenav {
      padding: 16px 8px;
    }

    .mat-sidenav-content {
      background: #fff;
      padding: 20px 50px;
    }
  `,
})
export class AppComponent {
  menuOpened = signal(true);
  menu = signal(menuLinks.filter((item) => item.title));
}
