import { Task, TaskStatus } from '../lib/types';
import { isOverdue, getDaysUntilDue, formatMinutes } from '../lib/contribution';

interface TaskTableProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const truncateAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function TaskTable({ tasks, onComplete, onEdit, onDelete, onStatusChange }: TaskTableProps) {
  const priorityColors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#F97316',
    urgent: '#EF4444',
  };

  const statusIcons = {
    pending: '⏸️',
    'in-progress': '🔵',
    completed: '✅',
  };

  const statusLabels = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
  };

  const getEfficiencyDisplay = (task: Task): { percentage: string; diff: string; color: string; emoji: string } => {
    if (!task.actualTime || task.status !== 'completed') {
      return { percentage: '-', diff: '', color: '#6B7280', emoji: '' };
    }

    const estimated = task.estimatedTime;
    const actual = task.actualTime;
    const efficiency = (estimated / actual) * 100;
    const diffMinutes = actual - estimated;

    let color = '#10B981'; // 緑（良好）
    let emoji = '🎯';
    
    if (efficiency >= 100) {
      // 予定時間以内に完了（効率100%以上）
      color = '#10B981';
      emoji = '🎯';
    } else if (efficiency >= 80) {
      // 予定時間の120%以内（効率80-100%）
      color = '#F59E0B';
      emoji = '⚠️';
    } else {
      // 予定時間を大幅に超過
      color = '#EF4444';
      emoji = '⏰';
    }

    const diffSign = diffMinutes > 0 ? '+' : '';
    const diffDisplay = `${diffSign}${formatMinutes(Math.abs(diffMinutes))}`;

    return {
      percentage: `${efficiency.toFixed(0)}%`,
      diff: diffDisplay,
      color,
      emoji,
    };
  };

  const getDueDateDisplay = (task: Task): { text: string; color: string } => {
    if (task.status === 'completed') {
      return { text: 'Done', color: '#10B981' };
    }
    
    const overdue = isOverdue(task);
    const daysLeft = getDaysUntilDue(task);
    
    if (overdue) {
      return { text: 'Overdue', color: '#EF4444' };
    }
    
    if (daysLeft === 0) {
      return { text: 'Today', color: '#F59E0B' };
    }
    
    if (daysLeft === 1) {
      return { text: 'Tomorrow', color: '#F59E0B' };
    }
    
    return { text: `${daysLeft}d`, color: '#6B7280' };
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1F2937', borderRadius: '0.5rem', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: '#111827', borderBottom: '1px solid #374151' }}>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#9CA3AF', width: '120px' }}>
              Status
            </th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#9CA3AF', minWidth: '200px' }}>
              Task
            </th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#9CA3AF', width: '100px' }}>
              Priority
            </th>
            {/* Phase 1: 「Assigned To」列追加 */}
            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#9CA3AF', width: '120px' }}>
              Assigned To
            </th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#9CA3AF', width: '150px' }}>
              Scheduled
            </th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#9CA3AF', width: '100px' }}>
              Est. Time
            </th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#9CA3AF', width: '100px' }}>
              Actual Time
            </th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#9CA3AF', width: '120px' }}>
              Efficiency
            </th>
            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#9CA3AF', width: '100px' }}>
              Due Date
            </th>
            <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#9CA3AF', width: '150px' }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => {
            const dueDateInfo = getDueDateDisplay(task);
            const efficiencyInfo = getEfficiencyDisplay(task);
            
            return (
              <tr
                key={task.id}
                style={{
                  borderBottom: index < tasks.length - 1 ? '1px solid #374151' : 'none',
                  backgroundColor: task.status === 'completed' ? '#065F4620' : 'transparent',
                }}
              >
                {/* Status */}
                <td style={{ padding: '0.75rem' }}>
                  {task.status !== 'completed' ? (
                    <select
                      value={task.status}
                      onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '0.375rem',
                        color: 'white',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="pending">⏸️ Pending</option>
                      <option value="in-progress">🔵 In Progress</option>
                    </select>
                  ) : (
                    <span style={{ fontSize: '0.875rem', color: '#10B981' }}>
                      ✅ Completed
                    </span>
                  )}
                </td>

                {/* Task Title */}
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ fontWeight: '500', color: 'white', marginBottom: '0.25rem' }}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                      {task.description}
                    </div>
                  )}
                </td>

                {/* Priority */}
                <td style={{ padding: '0.75rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'white',
                      backgroundColor: priorityColors[task.priority],
                      textTransform: 'capitalize',
                    }}
                  >
                    {task.priority}
                  </span>
                </td>

                {/* Phase 1: Assigned To列 */}
                <td style={{ padding: '0.75rem' }}>
                  {task.assignedTo ? (
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'white',
                        backgroundColor: '#3B82F6',
                      }}
                      title={task.assignedTo}
                    >
                      👤 {truncateAddress(task.assignedTo)}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                      -
                    </span>
                  )}
                </td>

                {/* Scheduled */}
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
                    <div>{new Date(task.scheduledDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      {task.scheduledStartTime} - {task.scheduledEndTime}
                    </div>
                    {task.isRecurring && (
                      <div style={{ fontSize: '0.65rem', color: '#8B5CF6', marginTop: '0.25rem' }}>
                        🔁 Weekly
                      </div>
                    )}
                  </div>
                </td>

                {/* Estimated Time */}
                <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#9CA3AF' }}>
                  {formatMinutes(task.estimatedTime)}
                </td>

                {/* Actual Time */}
                <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#9CA3AF' }}>
                  {task.actualTime ? formatMinutes(task.actualTime) : '-'}
                </td>

                {/* Efficiency */}
                <td style={{ padding: '0.75rem' }}>
                  {task.status === 'completed' && task.actualTime ? (
                    <div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        color: efficiencyInfo.color,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <span>{efficiencyInfo.emoji}</span>
                        <span>{efficiencyInfo.percentage}</span>
                      </div>
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: efficiencyInfo.color,
                        marginTop: '0.125rem'
                      }}>
                        {efficiencyInfo.diff}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>-</span>
                  )}
                </td>

                {/* Due Date */}
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: dueDateInfo.color }}>
                    {dueDateInfo.text}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                    {new Date(task.dueDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                  </div>
                </td>

                {/* Actions */}
                <td style={{ padding: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    {task.status !== 'completed' ? (
                      <>
                        <button
                          onClick={() => onEdit(task.id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#374151',
                            border: 'none',
                            borderRadius: '0.375rem',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onDelete(task.id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#7F1D1D',
                            border: 'none',
                            borderRadius: '0.375rem',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => onComplete(task.id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#065F46',
                            border: 'none',
                            borderRadius: '0.375rem',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                          title="Complete"
                        >
                          ✓
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {task.completedAt && new Date(task.completedAt).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
          No tasks to display
        </div>
      )}
    </div>
  );
}