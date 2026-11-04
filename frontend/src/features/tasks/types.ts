export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 1 | 2 | 3;

export type Task = {
  id: number;
  project: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
};
