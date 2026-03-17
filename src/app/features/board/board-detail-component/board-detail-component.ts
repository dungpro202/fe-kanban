import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from '../../../core/services/board-service';
import { Board, Task } from '../../../core/models/board.model';
import { TaskService } from '../../../core/services/task-service';
import { TaskDetailComponent } from '../task-detail-component/task-detail-component';
import { ColumnService } from '../../../core/services/column-service';

@Component({
  selector: 'app-board-detail-component',
  imports: [CommonModule, DragDropModule, TaskDetailComponent],
  templateUrl: './board-detail-component.html',
  styleUrl: './board-detail-component.scss',
})
export class BoardDetailComponent {
  private route = inject(ActivatedRoute);
  private boardService = inject(BoardService);
  private taskService = inject(TaskService);
  private columnService = inject(ColumnService);
  private cdr = inject(ChangeDetectorRef);


  board: Board | null = null;

  // Biến lưu task đang được chọn để xem chi tiết
  selectedTask: Task | null = null;
  // Biến quản lý trạng thái form tạo cột
  isAddingColumn = false;

  ngOnInit() {
    // Lấy ID từ URL (vd: /boards/1)
    const boardId = this.route.snapshot.paramMap.get('id');
    if (boardId) {
      this.loadBoardDetail(+boardId);
    }
  }

  loadBoardDetail(id: number) {
    this.boardService.getBoardDetail(id).subscribe({
      next: (data) => {
        this.board = data;
        console.log('Board Detail:', data);
        this.cdr.markForCheck();
      },
      error: (err) => console.error(err)
    });
  }

  // 🔥 LOGIC KÉO THẢ (Frontend Only - Chưa gọi API)
  drop(event: CdkDragDrop<Task[]>, columnId: number) {
    // 1. Xử lý UI (Optimistic UI - Cập nhật giao diện trước cho mượt)
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

    // 2. Lấy dữ liệu cần thiết để gọi API
    // Task đang được kéo (phải gắn [cdkDragData] ở HTML bước sau)
    const taskMoved = event.item.data as Task;

    // Cột mới (nơi thả xuống)
    const newColumnId = columnId; // ID cột lấy từ tham số truyền vào

    // Vị trí mới (Index trong mảng)
    const newPosition = event.currentIndex;

    console.log(`Moving Task ${taskMoved.id} to Column ${newColumnId} at pos ${newPosition}`);

    // 3. Gọi API Move (Chạy ngầm)
    this.taskService.moveTask(taskMoved.id, newColumnId, newPosition).subscribe({
      next: (res) => console.log('Saved position!', res),
      error: (err) => {
        console.error('Move failed!', err);
        // TODO: Nếu lỗi thì reload lại board để hoàn tác
        this.loadBoardDetail(this.board!.id);
      }
    });
  }

  // Helper để lấy danh sách ID của các cột (dùng cho cdkDropListConnectedTo)
  get columnIds(): string[] {

    return this.board?.columns.map(c => `col-${c.id}`) || [];
  }

  // Biến lưu ID cột đang được bật form thêm task
  addingTaskColumnId: number | null = null;

  createTask(columnId: number, title: string) {
    if (!title.trim()) return;

    this.taskService.createTask({
      title: title,
      columnId: columnId,
      boardId: this.board!.id // Gửi boardId nếu cần reload
    }).subscribe({
      next: (newTask) => {
        // 1. Tìm cột và push task vào mảng UI ngay lập tức (không cần reload trang)
        const column = this.board?.columns.find(c => c.id === columnId);
        if (column) {
          column.tasks.push(newTask);
        }

        // 2. Reset form
        this.addingTaskColumnId = null;
        this.cdr.markForCheck();
      },
      error: (err) => alert('Lỗi tạo task: ' + err.message)
    });
  }

  // Hàm mở modal
  openTaskDetail(task: Task) {
    this.selectedTask = { ...task }; // Clone object để tránh sửa trực tiếp vào UI khi chưa lưu
  }

  // Hàm xử lý khi modal báo update
  onTaskUpdated(updatedTask: Task) {
    // Tìm và cập nhật task trong mảng UI
    this.board?.columns.forEach(col => {
      const index = col.tasks.findIndex(t => t.id === updatedTask.id);
      if (index !== -1) {
        col.tasks[index] = updatedTask;
      }
    });
    // Cập nhật selectedTask luôn
    this.selectedTask = updatedTask;
  }

  // Hàm xử lý khi modal báo xóa
  onTaskDeleted(taskId: number) {
    this.board?.columns.forEach(col => {
      col.tasks = col.tasks.filter(t => t.id !== taskId);
    });
    this.selectedTask = null; // Đóng modal
  }

  // 1. TẠO CỘT MỚI (Dùng code này cho hiện tại)
  createColumn(title: string) {
    if (!title.trim() || !this.board) return;

    this.columnService.createColumn({
      title: title,
      boardId: this.board.id
    }).subscribe({
      next: (newColumn) => {

        if (!newColumn.tasks) {
          newColumn.tasks = [];
        }

        // Push cột mới vào mảng
        this.board!.columns.push(newColumn);
        this.isAddingColumn = false; // Đóng form

        // todo : sử dụng signal để cập nhật UI thay vì ép vẽ lại
        this.cdr.markForCheck();
      },
      error: (err) => alert('Lỗi tạo cột: ' + err.message)
    });
  }

  // 2. XÓA CỘT (Dùng code này cho hiện tại)
  deleteColumn(columnId: number) {
    if (!confirm('Bạn có chắc muốn xóa danh sách này và toàn bộ thẻ bên trong?')) return;

    this.columnService.deleteColumn(columnId).subscribe({
      next: () => {
        // Lọc bỏ cột vừa xóa ra khỏi mảng UI
        if (this.board) {
          this.board.columns = this.board.columns.filter(c => c.id !== columnId);
        }

         // todo : sử dụng signal để cập nhật UI thay vì ép vẽ lại
        this.cdr.markForCheck();
      },
      error: (err) => alert('Không thể xóa: ' + err.message)
    });
  }
  // 3. ĐỔI TÊN CỘT (Sẽ làm ở UI bước sau)
  updateColumnTitle(columnId: number, newTitle: string) {
    this.columnService.updateColumn(columnId, newTitle).subscribe();
  }
}
