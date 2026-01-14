import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL Backend (NestJS đang chạy port 3000)
  private apiUrl = 'http://localhost:3000';

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
}