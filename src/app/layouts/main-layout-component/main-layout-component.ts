import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { User } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout-component',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './main-layout-component.html',
  styleUrl: './main-layout-component.scss',
})
export class MainLayoutComponent {
  // Khai báo Observable (quy ước có dấu $ ở cuối)
  user$;
  
  constructor(private authService: AuthService) {
    this.user$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // Chỉ cần gọi hàm này để kích hoạt API, dữ liệu sẽ tự chạy vào user$
    this.authService.getProfile().subscribe(); 
  }

}
