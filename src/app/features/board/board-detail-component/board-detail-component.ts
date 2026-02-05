import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from '../../../core/services/board-service';
import { Board, Task } from '../../../core/models/board.model';
import { TaskService } from '../../../core/services/task-service';

@Component({
  selector: 'app-board-detail-component',
  imports: [CommonModule, DragDropModule],
  templateUrl: './board-detail-component.html',
  styleUrl: './board-detail-component.scss',
})
export class BoardDetailComponent {
  private route = inject(ActivatedRoute);
  private boardService = inject(BoardService);
  private taskService = inject(TaskService);
  private cdr = inject(ChangeDetectorRef);


  board: Board | null = null;

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
      },
      error: (err) => alert('Lỗi tạo task: ' + err.message)
    });
  }
}
