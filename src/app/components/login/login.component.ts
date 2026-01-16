import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  loginForm: FormGroup;
  submitted = false;
  sessionExpiredMessage: string | null = null;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur a été redirigé suite à l'expiration de la session
    this.route.queryParams.subscribe((params) => {
      if (params['reason'] === 'session-expired') {
        this.sessionExpiredMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.sessionExpiredMessage = null;

    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password);
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get isLoading() {
    return this.authService.isLoading;
  }

  get errorMessage() {
    return this.authService.error;
  }
}
