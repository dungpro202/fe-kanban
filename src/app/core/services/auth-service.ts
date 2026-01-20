import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL Backend (NestJS đang chạy port 3000)
  private apiUrl = 'http://localhost:3000';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, data).pipe(
      map(response => {
        // login thành công, lưu token vào localStorage
        if (response && response.access_token) {
          localStorage.setItem('access_token', response.access_token);
        }
        return response;
      })
    );
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  logout() {
    localStorage.removeItem('access_token');
    // todo : Chuyển hướng về login (sẽ xử lý ở component)
  }

  // Check xem đã login chưa
  isAuthenticated(): boolean {
    // check xem có token không
    // todo : Cần kiểm tra token hợp lệ hơn, hết hạn hay chưa
    return !!localStorage.getItem('access_token');
  }

  // Lấy thông tin User
  getProfile() {
    return this.http.get<User>(`${this.apiUrl}/auth/profile`).pipe(
      tap(user => {
        this.currentUserSubject.next(user); // Lưu user vào store
      })
    );
  }

  // Hàm tiện ích để lấy value hiện tại
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}