import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebarComponent, AdminNavbarComponent],
  template: `
    <div class="flex min-h-screen bg-[#f5f7fa]">
      <app-admin-sidebar></app-admin-sidebar>
      <main class="flex-1 ml-[280px] flex flex-col">
        <app-admin-navbar></app-admin-navbar>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {}
