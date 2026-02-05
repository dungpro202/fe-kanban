import { User } from './user.model'; 

// export interface Board {
//   id: number;
//   title: string;
//   description?: string;
//   createdAt: string;
//   updatedAt: string;
//   ownerId: number;
//   owner?: User;
  
//   // Các trường đếm (Count) từ Backend
//   // Todo: Change obj
//   _count?: {
//     columns: number;
//     members: number;
//   };
// }


// Interface cho Task
export interface Task {
  id: number;
  title: string;
  description?: string;
  position: number;
  columnId: number;
  assignee?: User;
  // more field...
}

// Interface cho Column
export interface Column {
  id: number;
  title: string;
  position: number;
  boardId: number;
  tasks: Task[]; // Cột chứa danh sách Task
}

export interface Board {
  id: number;
  title: string;
  columns: Column[]; //Board chứa danh sách Column
  members: any[];
  ownerId: number;
  // ...

  description?: string;
  createdAt: string;
  updatedAt: string;
  owner?: User;
}