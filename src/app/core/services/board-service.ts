import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Board } from '../models/board.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private http = inject(HttpClient);
  // URL Backend tạm thời
  private apiUrl = 'http://localhost:3000/boards'; 

  // 1. Lấy danh sách bảng
  getBoards() {
    return this.http.get<Board[]>(this.apiUrl);
  }

  // 2. Tạo bảng mới
  createBoard(data: { title: string; description?: string }) {
    return this.http.post<Board>(this.apiUrl, data);
  }

  // 3. Lấy chi tiết 1 bảng
  getBoardDetail(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}