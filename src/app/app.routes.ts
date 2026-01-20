import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout-component/auth-layout-component';
import { LoginComponent } from './features/auth/login-component/login-component';
import { RegisterComponent } from './features/auth/register-component/register-component';
import { MainLayoutComponent } from './layouts/main-layout-component/main-layout-component';
import { AuthGuard } from './core/guards/auth-guard';
import { BoardDetailComponent } from './features/board/board-detail-component/board-detail-component';
import { BoardListComponent } from './features/board/board-list-component/board-list-component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // 👇 Route mặc định: Vào app là thấy danh sách
      { path: '', component: BoardListComponent }, 
      
      // Route chi tiết
      { path: 'boards/:id', component: BoardDetailComponent },
    ]
  }
];