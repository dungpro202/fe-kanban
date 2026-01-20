import { User } from './user.model'; 

export interface Board {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: number;
  owner?: User;
  
  // Các trường đếm (Count) từ Backend
  // Todo: Change obj
  _count?: {
    columns: number;
    members: number;
  };
}