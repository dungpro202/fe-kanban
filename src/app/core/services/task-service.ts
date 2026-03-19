import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/board.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/tasks'; 

  // 1. Tạo Task mới
  createTask(data: { title: string; columnId: number; boardId: number }) { // boardId để refresh nếu cần
    return this.http.post<Task>(this.apiUrl, data);
  }

  // 2. Di chuyển Task (Quan trọng)
  moveTask(taskId: number, newColumnId: number, newPosition: number) {
    return this.http.post(`${this.apiUrl}/${taskId}/move`, {
      columnId: newColumnId,
      position: newPosition
    });
  }

  // 3. Cập nhật thông tin Task (Title, Description...)
  updateTask(id: number, data: { title?: string; description?: string; dueDate?: string | null }) {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, data);
  }

  // 4. Xóa Task
  deleteTask(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // 5. Gán người thực hiện task
  assignUser(taskId: number, assigneeId: number | null) {
    return this.http.post<Task>(`${this.apiUrl}/${taskId}/assign`, { assigneeId });
  }
}