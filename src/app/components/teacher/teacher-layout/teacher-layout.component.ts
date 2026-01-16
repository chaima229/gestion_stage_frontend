import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TeacherSidebarComponent } from '../teacher-sidebar/teacher-sidebar.component';
import { AdminNavbarComponent } from '../../admin/admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TeacherSidebarComponent, AdminNavbarComponent],
  template: `
    <div class="flex min-h-screen bg-[#f5f7fa]">
      <app-teacher-sidebar></app-teacher-sidebar>
      <main class="flex-1 ml-[280px] flex flex-col">
        <app-admin-navbar></app-admin-navbar>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class TeacherLayoutComponent {}
