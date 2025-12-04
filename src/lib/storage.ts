import { Task, Project } from './types';

const STORAGE_KEYS = {
  PROJECT: 'suilog_project',
  TASKS: 'suilog_tasks',
};

const createDefaultProject = (): Project => ({
  id: 'default',
  name: 'My Project',
  description: 'Personal task management',
  startDate: Date.now(),
  status: 'active',
});

export const storage = {
  getProject: (): Project => {
    if (typeof window === 'undefined') return createDefaultProject();
    const data = localStorage.getItem(STORAGE_KEYS.PROJECT);
    return data ? JSON.parse(data) : createDefaultProject();
  },
  
  saveProject: (project: Project): void => {
    localStorage.setItem(STORAGE_KEYS.PROJECT, JSON.stringify(project));
  },
  
  getTasks: (): Task[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  },
  
  saveTasks: (tasks: Task[]): void => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },
  
  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEYS.PROJECT);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
  },
};