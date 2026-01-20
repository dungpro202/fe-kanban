import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Board } from '../../../core/models/board.model';
import { BoardService } from '../../../core/services/board-service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board-list-component',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './board-list-component.html',
  styleUrl: './board-list-component.scss',
})
export class BoardListComponent implements OnInit {
  private boardService = inject(BoardService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  boards: Board[] = [];
  isLoading = true;
  showCreateModal = false; // Biến bật tắt modal tạo bảng

  // Form tạo bảng
  createForm = this.fb.group({
    title: ['', Validators.required],
    description: ['']
  });

  ngOnInit() {
    this.loadBoards();
  }

  loadBoards() {
    this.isLoading = true;
    this.boardService.getBoards().subscribe({
      next: (data) => {
        this.boards = data;
        this.isLoading = false;

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  createBoard() {
    if (this.createForm.invalid) return;

    this.boardService.createBoard(this.createForm.value as any).subscribe({
      next: (newBoard) => {
        // Thêm board mới vào list và đóng modal
        this.boards.unshift(newBoard); 
        this.showCreateModal = false;
        this.createForm.reset();
      },
      error: (err) => alert('Lỗi tạo bảng: ' + err.message)
    });
  }
}
