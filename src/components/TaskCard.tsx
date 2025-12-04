import { useState } from 'react';
import { Task, Priority, TaskStatus } from '../lib/types';
import { isOverdue, getDaysUntilDue, formatMinutes } from '../lib/contribution';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export default function TaskCard({ task, onComplete, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const priorityColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500',
  };

  const statusColors = {
    pending: 'bg-gray-600',
    'in-progress': 'bg-blue-600',
    completed: 'bg-green-600',
  };

  const statusLabels = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
  };

  const overdue = isOverdue(task);
  const daysUntilDue = getDaysUntilDue(task);

  const handleSave = () => {
    onEdit(editedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  // 編集モード
  if (isEditing) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg border-2 border-blue-500">
        <input
          type="text"
          value={editedTask.title}
          onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
          className="w-full px-3 py-2 mb-3 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Task title"
        />
        
        <textarea
          value={editedTask.description}
          onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
          className="w-full px-3 py-2 mb-3 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Description"
        />
        
        <div className="grid grid-cols-4 gap-2 mb-3">
          {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setEditedTask({ ...editedTask, priority: p })}
              className={`py-1 rounded text-sm capitalize ${
                editedTask.priority === p ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        
        <div className="mb-3">
          <label className="block text-sm text-gray-300 mb-1">Estimated Time (minutes)</label>
          <input
            type="number"
            value={editedTask.estimatedTime}
            onChange={(e) => setEditedTask({ ...editedTask, estimatedTime: Math.max(15, Number(e.target.value)) })}
            min="15"
            step="15"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={new Date(editedTask.startDate).toISOString().split('T')[0]}
              onChange={(e) => setEditedTask({ ...editedTask, startDate: new Date(e.target.value).getTime() })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Due Date</label>
            <input
              type="date"
              value={new Date(editedTask.dueDate).toISOString().split('T')[0]}
              onChange={(e) => setEditedTask({ ...editedTask, dueDate: new Date(e.target.value).getTime() })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium">
            Save
          </button>
          <button onClick={handleCancel} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // 表示モード
  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        task.status === 'completed'
          ? 'bg-green-900/20 border-green-700'
          : overdue
          ? 'bg-red-900/20 border-red-700'
          : task.status === 'in-progress'
          ? 'bg-blue-900/20 border-blue-700'
          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
      }`}
    >
      {/* タイトルと操作ボタン */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3
            className={`font-bold text-lg ${
              task.status === 'completed'
                ? 'text-green-400 line-through'
                : overdue
                ? 'text-red-400'
                : 'text-white'
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-gray-400 text-sm mt-1">{task.description}</p>
          )}
        </div>
        
        <div className="flex gap-2 ml-4">
          {task.status !== 'completed' && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                title="Delete"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* バッジ */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white capitalize ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        
        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
          ⏱️ {formatMinutes(task.estimatedTime)}
          {task.actualTime && ` → ${formatMinutes(task.actualTime)}`}
        </span>
        
        {task.actualTime && task.estimatedTime && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
              task.actualTime <= task.estimatedTime
                ? 'bg-green-600'
                : task.actualTime <= task.estimatedTime * 1.2
                ? 'bg-yellow-600'
                : 'bg-orange-600'
            }`}
          >
            ⚡ {((task.estimatedTime / task.actualTime) * 100).toFixed(0)}%
          </span>
        )}
        
        {task.status !== 'completed' && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              overdue
                ? 'bg-red-600 text-white'
                : daysUntilDue <= 3
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {overdue ? `⚠️ Overdue` : daysUntilDue === 0 ? '📅 Today' : `📅 ${daysUntilDue}d`}
          </span>
        )}
      </div>
      
      {/* 日付情報 */}
      <div className="text-xs text-gray-500 mb-3">
        {new Date(task.startDate).toLocaleDateString()} → {new Date(task.dueDate).toLocaleDateString()}
        {task.completedAt && (
          <> • Completed: {new Date(task.completedAt).toLocaleDateString()}</>
        )}
      </div>
      
      {/* ステータス変更と完了ボタン */}
      {task.status !== 'completed' ? (
        <div className="flex gap-2">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
          </select>
          <button
            onClick={() => onComplete(task.id)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
          >
            Complete
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
            ✓ Completed
          </span>
        </div>
      )}
    </div>
  );
}