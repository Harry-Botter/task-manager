import { Task } from './types';

export function calculateGanttData(tasks: Task[]) {
    if (tasks.length === 0) {
        return {
            tasks: [],
            minDate: Date.now(),
            maxDate: Date.now() + 24 * 60 * 60 * 1000,
        };
    }

    const ganttTasks = tasks.map(task => ({
        id: task.id,
        title: task.title,
        startDate: task.startDate,
        dueDate: task.dueDate,
        progress: task.status === 'completed' ? 100 : task.status === 'in-progress' ? 50 : 0,
        status: task.status,
        priority: task.priority,
    }));

    const minDate = Math.min(...ganttTasks.map(t => t.startDate));
    const maxDate = Math.max(...ganttTasks.map(t => t.dueDate));

    return { tasks: ganttTasks, minDate, maxDate};
}

export function getDaysInRange(minDate: number, maxDate: number): Date[] {
    const days: Date[] = [];
    const current = new Date(minDate);
    current.setHours(0,0,0,0);

    while (current <= new Date(maxDate)) {
        days.push(new Date(current));
        current.setDate(current.getDate() +1);
    }
    return days;
}

export function getTaskPosition(taskStart: number, taskEnd: number, minDate: number, maxDate: number) {
    const totalDays = (maxDate - minDate) / (1000 * 60 * 60 * 24);
    const startOffset = (taskStart - minDate) / (1000 * 60 * 60 * 24);
    const width = (taskEnd - taskStart) / (1000 * 60 * 60 * 24);

    return {
        left: (startOffset / totalDays) * 100,
        width: (width / totalDays) * 100,
    };
}