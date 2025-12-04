export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type RecurringPattern = 'weekly'; // MVPは毎週のみ

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
}

export interface ContributionDetail {
  totalTasks: number;
  completedTasks: number;
  totalEstimatedTime: number;
  totalActualTime: number;
  contributionScore: number;
}

// export interface TaskContribution {
//     taskId: string;
//     taskTitle: string;
//     V: number; //タスクの重要度スコア
//     E: number; //タスクの効率度スコア
//     T: number; //タスクの納期遵守スコア
//     C: number; //タスクの完了度スコア
//     contributionScore: number; //タスクの総合貢献度スコア V*E*T*C
// }