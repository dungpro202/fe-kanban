import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Task } from '../../../core/models/board.model';
import { TaskService } from '../../../core/services/task-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-detail-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-detail-component.html',
  styleUrl: './task-detail-component.scss',
})
export class TaskDetailComponent {
  private taskService = inject(TaskService);

  @Input() task!: Task; // Nhận task từ BoardDetail
  @Output() close = new EventEmitter<void>(); // Báo đóng modal
  @Output() taskUpdated = new EventEmitter<Task>(); // Báo update thành công để refresh UI
  @Output() taskDeleted = new EventEmitter<number>(); // Báo xóa thành công

  isEditingTitle = false;

  // Lưu mô tả (Description)
  saveDescription() {
    this.taskService.updateTask(this.task.id, { 
      description: this.task.description 
    }).subscribe({
      next: (updatedTask) => {
        this.task = updatedTask; // Cập nhật local
        this.taskUpdated.emit(updatedTask); // Báo ra ngoài
        alert('Đã lưu mô tả!');
      },
      error: (err) => alert('Lỗi: ' + err.message)
    });
  }

  // Lưu tiêu đề (Title) khi blur hoặc enter
  saveTitle() {
    this.isEditingTitle = false;
    if (!this.task.title.trim()) return;

    this.taskService.updateTask(this.task.id, { 
      title: this.task.title 
    }).subscribe({
      next: (updatedTask) => this.taskUpdated.emit(updatedTask)
    });
  }

  deleteTask() {
    if (!confirm('Bạn có chắc muốn xóa thẻ này không?')) return;

    this.taskService.deleteTask(this.task.id).subscribe({
      next: () => {
        this.taskDeleted.emit(this.task.id);
        this.close.emit();
      }
    });
  }
}
