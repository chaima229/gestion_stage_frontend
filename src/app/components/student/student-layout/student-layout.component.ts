import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentSidebarComponent } from '../student-sidebar/student-sidebar.component';
import { AdminNavbarComponent } from '../../admin/admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, StudentSidebarComponent, AdminNavbarComponent],
  template: `
    <div class="flex min-h-screen bg-[#f5f7fa]">
      <app-student-sidebar></app-student-sidebar>
      <main class="flex-1 ml-[280px] flex flex-col">
        <app-admin-navbar></app-admin-navbar>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class StudentLayoutComponent {}
