import { Task } from './types';
import { v4 as uuidv4 } from 'uuid';

/* 繰り返しタスクを生成 */
export function generateRecurringTasks(baseTask: Task): Task[] {
  if (!baseTask.isRecurring || !baseTask.recurringEndDate || baseTask.recurringDayOfWeek === undefined) {
    return [baseTask];
  }

  const tasks: Task[] = [];
  const parentId = baseTask.id;
  let currentDate = new Date(baseTask.scheduledDate);
  const endDate = new Date(baseTask.recurringEndDate);

  // 最初のタスクを追加
  tasks.push({
    ...baseTask,
    recurringParentId: parentId,
  });

  // 繰り返しタスクを生成
  while (true) {
    // 次の週の同じ曜日を計算
    currentDate.setDate(currentDate.getDate() + 7);

    if (currentDate > endDate) break;

    // 新しいタスクを作成
    const newTask: Task = {
      ...baseTask,
      id: uuidv4(),
      scheduledDate: currentDate.getTime(),
      startDate: currentDate.getTime(),
      dueDate: currentDate.getTime(),
      createdAt: Date.now(),
      recurringParentId: parentId,
    };

    tasks.push(newTask);
  }

  return tasks;
}

/**
 * 時刻文字列から分数を計算
 * "13:00" → 780分
 */
export function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/* 開始・終了時刻から所要時間を計算 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);
  return endMinutes - startMinutes;
}