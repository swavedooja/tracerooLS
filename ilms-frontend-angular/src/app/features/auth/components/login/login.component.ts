import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<void>();
  
  loginForm: FormGroup;
  showPassword = false;
  error = '';
  particles = Array(15).fill(0);

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      if (username === 'admin' && password === 'admin123') {
        this.loginSuccess.emit();
      } else {
        this.error = 'Invalid credentials. Try username: admin, password: admin123';
      }
    }
  }

  getParticleStyle(i: number) {
    return {
      position: 'absolute',
      width: Math.random() * 60 + 20 + 'px',
      height: Math.random() * 60 + 20 + 'px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(25, 118, 210, 0.3), rgba(66, 165, 245, 0.1))',
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      filter: 'blur(40px)',
      pointerEvents: 'none',
      animation: `particleAnim 8s ease-in-out infinite ${i * 0.3}s`
    };
  }
}
