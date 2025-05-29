export type Priority = 'low' | 'medium' | 'high' | 'none';
export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type TaskFilter = 'all' | 'today' | 'this_week' | 'upcoming' | string; // string for project IDs

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  priority: Priority;
  status: TaskStatus;
  projectId?: string;
  category?: string; // AI suggested
  createdAt: string; // ISO string
}

export interface Project {
  id: string;
  name: string;
  color?: string; // Hex color string for project visualization
}