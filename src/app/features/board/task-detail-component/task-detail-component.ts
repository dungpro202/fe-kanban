import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
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
export class TaskDetailComponent implements OnChanges {
  private taskService = inject(TaskService);

  @Input() task!: Task; // Nhận task từ BoardDetail
  @Input() members: any[] = []; // Nhận danh sách thành viên để gán task
  @Output() close = new EventEmitter<void>(); // Báo đóng modal
  @Output() taskUpdated = new EventEmitter<Task>(); // Báo update thành công để refresh UI
  @Output() taskDeleted = new EventEmitter<number>(); // Báo xóa thành công



  isEditingTitle = false;
  showMemberDropdown = false; // Biến bật/tắt menu chọn người

  // Biến tạm để giữ giá trị ngày giờ trên form (chưa lưu)
  tempDueDate: string | null = null;

  // Hàm này tự chạy khi Modal được mở ra và nhận @Input() task
  ngOnChanges(changes: SimpleChanges) {
    if (changes['task'] && this.task) {
      this.initTempDueDate();
    }
  }

  // Chuyển đổi DateTime sang chuẩn YYYY-MM-DDTHH:mm của thẻ input datetime-local
  initTempDueDate() {
    if (this.task.dueDate) {
      const d = new Date(this.task.dueDate);
      // Xử lý bù múi giờ (Timezone offset) để hiển thị đúng giờ local của máy tính
      const tzOffset = d.getTimezoneOffset() * 60000;
      this.tempDueDate = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
    } else {
      this.tempDueDate = null;
    }
  }

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
  // 1. Hàm Lưu ngày giờ
  saveDueDate() {
    // Nếu có chọn ngày thì chuyển về chuẩn ISO cho Backend, nếu rỗng thì là null
    const finalDate = this.tempDueDate ? new Date(this.tempDueDate).toISOString() : null;

    this.taskService.updateTask(this.task.id, { dueDate: finalDate }).subscribe({
      next: (updatedTask) => {
        // Merge lại để không mất mô tả đang gõ dở
        updatedTask.description = this.task.description;
        updatedTask.title = this.task.title;

        this.task = updatedTask;
        this.taskUpdated.emit(updatedTask); // Báo ra ngoài Board update UI
        alert('Đã lưu ngày hết hạn!');
      },
      error: (err) => alert('Lỗi lưu ngày: ' + err.message)
    });
  }

  // 2. Hàm Gỡ bỏ ngày giờ
  removeDueDate() {
    this.tempDueDate = null; // Xóa UI trước

    this.taskService.updateTask(this.task.id, { dueDate: null }).subscribe({
      next: (updatedTask) => {
        updatedTask.description = this.task.description;
        updatedTask.title = this.task.title;

        this.task = updatedTask;
        this.taskUpdated.emit(updatedTask);
      },
      error: (err) => alert('Lỗi gỡ bỏ ngày: ' + err.message)
    });
  }

}
