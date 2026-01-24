import { Task } from "../lib/types";
import { calculateGanttData, getDaysInRange, getTaskPosition } from "../lib/gantt";
import { useState } from "react";

interface GanttChartProps {
    tasks: Task[];
}

export default function GanttCharrt({ tasks }: GanttChartProps) {
    const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
    const {tasks: ganttTasks, minDate, maxDate} = calculateGanttData(tasks);
    const days = getDaysInRange(minDate, maxDate);

    const priorityColors = {
        low: '#10B9816',
        medium: '#F59E0B',
        high: '#EF5350',
        urgent: '#c41e3a'
    };
    const statusColors = {
        pending: '#6B7280',
        'in-progress': '#3B82F6',
        completed: '#10b981'
    };
    return (
        <div style={{backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '1.5rem', overflowX: 'auto'}}>
            <h2 style={{fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white'}}>📊 Gantt Chart</h2>
            <div style={{display: 'flex', gap: '1rem', minWidth: '100%%'}}>
                {/* タスクリスト */}
                <div style={{ minWidth: '200px', borderRight: '1px solid #374151', paddingRight: '1rem' }}>
                    {ganttTasks.map(task => (
                        <div
                            key={task.id}
                            style={{
                                padding: '0.5rem',
                                borderBottom: '1px solid #374151',
                                fontSize: '0.875rem',
                                color: '#E5E7EB',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                backgroundColor: hoveredTaskId === task.id ? '#374151' : 'transparent',
                            }}
                            onMouseEnter={() => setHoveredTaskId(task.id)}
                            onMouseLeave={() => setHoveredTaskId(null)}
                           >
                            {task.title}
                        </div>
                    ))}
                </div>
                {/* タイムライン */}
                <div style={{flex: 1, minWidth: '600px'}}>
                    {/* 日付ヘッダー */}
                    <div style={{display: 'flex', marginBottom: '0.5rem'}}>
                        {days.map(day => (
                            <div
                             key={day.toISOString()}
                             style={{
                                flex: 1,
                                textAlign: 'center',
                                fontSize: '0.65rem',
                                color: '#9CA3AF',
                                padding: '0.25rem',
                             }}>
                                {day.getDate()}
                            </div>
                        ))}
                    </div>

                    {/* タスクバー */}
                    {ganttTasks.map(task => {
                        const position = getTaskPosition(task.startDate, task.dueDate, minDate, maxDate);
                        return (
                            <div
                             key={task.id}
                             style={{
                                display: 'flex',
                                height: '2.5rem',
                                alignItems: 'center',
                                borderBottom: '1px solid #374151',
                                position: 'relative',
                             }}
                             onMouseEnter={() => setHoveredTaskId(task.id)}
                             onMouseLeave={() => setHoveredTaskId(null)}
                            >
                             <div
                              style={{
                                position: 'absolute',
                                left: `${position.left}%`,
                                width: `${position.width}%`,
                                height: '1.5rem',
                                backgroundColor: statusColors[task.status],
                                borderRadius: '0.25rem',
                                opacity: hoveredTaskId === task.id ? 1 : 0.8,
                                transition: 'all 0.2s',
                                borderLeft: `3px solid ${priorityColors[task.priority]}`,
                                display: 'flex',
                                alignItems: 'center',
                                paddingLeft: '0.5rem',
                                fontSize: '0.65rem',
                                color: 'white',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={`${task.title} (${task.progress}%)`}
                            >
                                {task.progress}%
                             </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}