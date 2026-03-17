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
  @Input() members: any[] = []; // Nhận danh sách thành viên để gán task
  @Output() close = new EventEmitter<void>(); // Báo đóng modal
  @Output() taskUpdated = new EventEmitter<Task>(); // Báo update thành công để refresh UI
  @Output() taskDeleted = new EventEmitter<number>(); // Báo xóa thành công

  

  isEditingTitle = false;
  showMemberDropdown = false; // Biến bật/tắt menu chọn người

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


  // Hàm gán thành viên
  assignMember(userId: number | null) {
    this.taskService.assignUser(this.task.id, userId).subscribe({
      next: (updatedTask) => {
        this.task = updatedTask; // Cập nhật UI local
        this.taskUpdated.emit(updatedTask); // Báo cho Board ngoài kia biết
        this.showMemberDropdown = false; // Đóng dropdown
      },
      error: (err) => alert('Lỗi phân công: ' + err.message)
    });
  }
}
