import { Task, Priority, ContributionDetail } from './types';

const PRIORITY_SCORES: Record<Priority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 5,
};

function calculateEfficiencyScore(estimated: number, actual: number | undefined): number {
  if (!actual) return 1.0;
  const ratio = estimated / actual;
  return Math.min(1.5, Math.max(0.5, ratio));
}

function calculateTimelinessScore(dueDate: number, completedAt: number | undefined): number {
  if (!completedAt) return 0;
  const daysLate = Math.max(0, Math.ceil((completedAt - dueDate) / (1000 * 60 * 60 * 24)));
  if (daysLate === 0) return 1.0;
  return Math.max(0.5, 1.0 - daysLate * 0.1);
}

export function calculateContribution(tasks: Task[]): ContributionDetail {
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  
  const totalEstimatedTime = completedTasks.reduce((sum, t) => sum + t.estimatedTime, 0);
  const totalActualTime = completedTasks.reduce((sum, t) => sum + (t.actualTime || t.estimatedTime), 0);
  
  const contributionScore = completedTasks.reduce((sum, task) => {
    const V = PRIORITY_SCORES[task.priority];
    const E = calculateEfficiencyScore(task.estimatedTime, task.actualTime);
    const T = calculateTimelinessScore(task.dueDate, task.completedAt);
    return sum + V * E * T;
  }, 0);
  
  return {
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,
    totalEstimatedTime,
    totalActualTime,
    contributionScore: Math.round(contributionScore * 10) / 10,
  };
}

export function isOverdue(task: Task): boolean {
  return task.status !== 'completed' && Date.now() > task.dueDate;
}

export function getDaysUntilDue(task: Task): number {
  return Math.ceil((task.dueDate - Date.now()) / (1000 * 60 * 60 * 24));
}

// 分を「◯h ◯m」形式に変換
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export interface DailyWorkHours {
  date: string; // YYYY-MM-DD形式
  dayOfWeek: string; // 曜日
  totalMinutes: number; // その日の総労働時間（分）
  isToday: boolean;
  isOvertime: boolean; // 8時間を超えているかどうか
}
/* 過去7日間の日別作業時間を計算 */
export function calculateWeeklyWorkHours(tasks: Task[]): DailyWorkHours[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 今日の日付を0時に設定

  const weekData: DailyWorkHours[] = [];

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const tasksPlannedonDay = tasks.filter((task) => {
      const due = new Date(task.dueDate);
      return due >= targetDate && due < nextDay;
    });

    //合計作業時間を計算
    const totalMinutes = tasksPlannedonDay.reduce((sum, task) => {
      return sum + task.estimatedTime;
    },0);

    const isToday = targetDate.toDateString() === today.toDateString();

    weekData.push({
      date: targetDate.toISOString().split('T')[0],
      dayOfWeek: targetDate.toLocaleDateString('ja-JP', {weekday: 'short'}),
      totalMinutes,
      isToday,
      isOvertime: totalMinutes > 480, // 8時間を超えているかどうか
    });
  }
  return weekData;
}
/*分を時間表記に変換*/
export function formatHours(minutes: number): string {
  const hours = minutes / 60;
  return `${hours.toFixed(1)} h`;
}

export interface DailySchedule {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // 月, 火, 水...
  scheduledMinutes: number; // 予定された作業時間(分)
  actualMinutes: number; // 実績作業時間(分)
  isToday: boolean;
  isOvertime: boolean; // 8時間超え
  scheduledTasks: Task[]; // その日の予定タスク
  completedTasks: Task[]; // その日の完了タスク
}

/**
 * 未来2週間(今日含む)のスケジュールを計算
 */
export function calculateWeeklySchedule(tasks: Task[]): DailySchedule[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduleData: DailySchedule[] = [];

  // 今日 + 未来13日 = 14日間
  for (let i = 0; i < 14; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    // その日に予定されているタスク
    const scheduledTasks = tasks.filter((task) => {
      const taskDate = new Date(task.scheduledDate);
      return taskDate >= targetDate && taskDate < nextDay;
    });

    // その日に完了したタスク
    const completedTasks = scheduledTasks.filter((task) => task.status === 'completed');

    // 予定時間の合計
    const scheduledMinutes = scheduledTasks
      .filter((task) => task.status !== 'completed')
      .reduce((sum, task) => {
        return sum + task.estimatedTime;
      }, 0);

    // 実績時間の合計
    const actualMinutes = completedTasks.reduce((sum, task) => {
      return sum + (task.actualTime || task.estimatedTime);
    }, 0);

    const isToday = targetDate.toDateString() === today.toDateString();

    scheduleData.push({
      date: targetDate.toISOString().split('T')[0],
      dayOfWeek: targetDate.toLocaleDateString('ja-JP', { weekday: 'short' }),
      scheduledMinutes,
      actualMinutes,
      isToday,
      isOvertime: actualMinutes > 480 || scheduledMinutes > 480, // 8時間 = 480分
      scheduledTasks,
      completedTasks,
    });
  }

  return scheduleData;
}