export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type RecurringPattern = 'weekly'; // MVPは毎週のみ
export type FilterType = 'all' | 'today' | 'pending' | 'in-progress' | 'completed' | 'myTasks' | 'unassigned' | 'byMember'; // ← 追加

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  estimatedTime: number; // 見積もり時間(分)
  actualTime?: number; // 実績時間(分)
  
  // 作業予定日時
  scheduledDate: number; // 作業予定日(Unix timestamp)
  scheduledStartTime: string; // 開始時刻 "13:00"
  scheduledEndTime: string; // 終了時刻 "14:00"
  
  // 繰り返し設定
  isRecurring: boolean; // 繰り返しタスクか
  recurringPattern?: RecurringPattern; // 繰り返しパターン
  recurringEndDate?: number; // 繰り返し終了日(Unix timestamp)
  recurringDayOfWeek?: number; // 0=日曜, 1=月曜, ..., 6=土曜
  recurringParentId?: string; // 繰り返しタスクの親ID(同じグループ識別用)
  
  startDate: number; // 開始日(Unix timestamp) - 既存
  dueDate: number; // 締切日(Unix timestamp) - 既存
  status: TaskStatus;
  createdAt: number;
  completedAt?: number;
  
  // Phase 1: マルチユーザー対応
  assignedTo?: string | null; // 担当者のウォレットアドレス（nullの場合はUnassigned）
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: number;
  completedAt?: number;
  status: 'active' | 'completed';
  nftMinted?: boolean;
  nftObjectId?: string;
  
  // Phase 1: マルチユーザー対応
  members?: string[]; // メンバーのウォレットアドレス配列
}

export interface ContributionDetail {
  totalTasks: number;
  completedTasks: number;
  totalEstimatedTime: number;
  totalActualTime: number;
  contributionScore: number;
}

export interface GanttChart {
  id: string;
  title: string;
  startDate: number;
  dueDate: number;
  progress: number;
  status: TaskStatus;
  priority: Priority;
}

export interface GanttChartData {
  tasks: GanttChart[];
  minDate: number;
  maxDate: number;
}