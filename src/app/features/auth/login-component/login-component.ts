import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service'; // Check lại đường dẫn service
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    RouterLink           // Để bấm link chuyển sang trang Register
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss' 
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Khởi tạo form với 2 trường email và password
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    // 1. Nếu form lỗi thì không làm gì cả
    if (this.loginForm.invalid) {
      return;
    }

    // 2. Bắt đầu gọi API
    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        // 3. Thành công -> Chuyển hướng vào trang Board
        this.isLoading = false;
        console.log('Login success:', res);
        // Giả sử server trả về user, ta điều hướng vào board đầu tiên hoặc trang dashboard
        // Tạm thời mình fix cứng vào board id 1 để test
        this.router.navigate(['/app/boards/1']);
      },
      error: (err) => {
        // 4. Thất bại -> Hiện lỗi
        this.isLoading = false;
        console.error(err);
        this.errorMessage = err.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      }
    });
  }
}