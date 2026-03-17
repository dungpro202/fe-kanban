import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Column } from '../models/board.model';

@Injectable({
  providedIn: 'root'
})
export class ColumnService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/columns'; // URL Backend

  createColumn(data: { title: string; boardId: number }) {
    return this.http.post<Column>(this.apiUrl, data);
  }

  updateColumn(id: number, title: string) {
    return this.http.patch<Column>(`${this.apiUrl}/${id}`, { title });
  }

  deleteColumn(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}