import { useState, useEffect } from 'react';
import { Task, Priority } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';
import { calculateDurationMinutes } from '../lib/recurringTasks';
import MemberSelector from './MemberSelector';

interface TaskFormProps {
  onAddTask?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onCancel?: () => void;
  editingTask?: Task;
  members?: string[]; // Phase 1: メンバーリスト
  currentUserAddress?: string; // Phase 1: 現在のウォレットアドレス
}

export default function TaskForm({ 
  onAddTask, 
  onEditTask, 
  onCancel, 
  editingTask,
  members = [],
  currentUserAddress,
}: TaskFormProps) {
  const isEditMode = !!editingTask;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [scheduledStartTime, setScheduledStartTime] = useState('09:00');
  const [scheduledEndTime, setScheduledEndTime] = useState('10:00');
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringEndDate, setRecurringEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Phase 1: 担当者フィールド追加
  const [assignedTo, setAssignedTo] = useState<string | null>(null);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority);
      setScheduledDate(new Date(editingTask.scheduledDate).toISOString().split('T')[0]);
      setScheduledStartTime(editingTask.scheduledStartTime);
      setScheduledEndTime(editingTask.scheduledEndTime);
      setIsRecurring(editingTask.isRecurring || false);
      if (editingTask.recurringEndDate) {
        setRecurringEndDate(new Date(editingTask.recurringEndDate).toISOString().split('T')[0]);
      }
      setDueDate(new Date(editingTask.dueDate).toISOString().split('T')[0]);
      // Phase 1: 既存タスクから担当者を読み込む
      setAssignedTo(editingTask.assignedTo ?? null);
    } else {
      // 新規作成時は現在のユーザーをデフォルト割り当て
      if (currentUserAddress) {
        setAssignedTo(currentUserAddress);
      }
    }
  }, [editingTask, currentUserAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const scheduledDateTime = new Date(scheduledDate).getTime();
    const estimatedTime = calculateDurationMinutes(scheduledStartTime, scheduledEndTime);
    const dayOfWeek = new Date(scheduledDate).getDay();
    
    if (isEditMode && editingTask) {
      const updatedTask: Task = {
        ...editingTask,
        title: title.trim(),
        description: description.trim(),
        priority,
        estimatedTime,
        scheduledDate: scheduledDateTime,
        scheduledStartTime,
        scheduledEndTime,
        isRecurring,
        recurringPattern: isRecurring ? 'weekly' : undefined,
        recurringEndDate: isRecurring ? new Date(recurringEndDate).getTime() : undefined,
        recurringDayOfWeek: isRecurring ? dayOfWeek : undefined,
        dueDate: new Date(dueDate).getTime(),
        // Phase 1: 担当者情報を保存
        assignedTo,
      };
      
      onEditTask?.(updatedTask);
    } else {
      const newTask: Task = {
        id: uuidv4(),
        title: title.trim(),
        description: description.trim(),
        priority,
        estimatedTime,
        scheduledDate: scheduledDateTime,
        scheduledStartTime,
        scheduledEndTime,
        isRecurring,
        recurringPattern: isRecurring ? 'weekly' : undefined,
        recurringEndDate: isRecurring ? new Date(recurringEndDate).getTime() : undefined,
        recurringDayOfWeek: isRecurring ? dayOfWeek : undefined,
        startDate: scheduledDateTime,
        dueDate: new Date(dueDate).getTime(),
        status: 'pending',
        createdAt: Date.now(),
        // Phase 1: 担当者情報を設定
        assignedTo,
      };
      
      onAddTask?.(newTask);
    }
  };

  const estimatedMinutes = calculateDurationMinutes(scheduledStartTime, scheduledEndTime);
  const estimatedHours = (estimatedMinutes / 60).toFixed(1);

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
      {/* ヘッダー */}
      <div style={{ 
        padding: '1.5rem',
        borderBottom: '1px solid #374151',
        position: 'sticky',
        top: 0,
        backgroundColor: '#1F2937',
        zIndex: 10,
      }}>
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          {isEditMode ? '✏️ Edit Task' : '✨ Create New Task'}
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          {isEditMode ? 'Update your task details' : 'Plan your work and conquer your goals'}
        </p>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* 基本情報セクション */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '2px solid #374151'
          }}>
            <span style={{ fontSize: '1.25rem' }}>📝</span>
            <h4 className="text-lg font-semibold text-white">Basic Information</h4>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Task Title <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to accomplish?"
              required
              className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, notes, or context..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => {
                const priorityConfig = {
                  low: { emoji: '🟢', color: 'bg-green-600', hoverColor: 'hover:bg-green-700', label: 'Low' },
                  medium: { emoji: '🟡', color: 'bg-yellow-600', hoverColor: 'hover:bg-yellow-700', label: 'Medium' },
                  high: { emoji: '🟠', color: 'bg-orange-600', hoverColor: 'hover:bg-orange-700', label: 'High' },
                  urgent: { emoji: '🔴', color: 'bg-red-600', hoverColor: 'hover:bg-red-700', label: 'Urgent' },
                };
                const config = priorityConfig[p];
                
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-3 rounded-lg text-sm font-medium transition-all transform ${
                      priority === p
                        ? `${config.color} text-white scale-105 shadow-lg`
                        : `bg-gray-700 text-gray-300 ${config.hoverColor} hover:scale-105`
                    }`}
                  >
                    <div>{config.emoji}</div>
                    <div className="text-xs mt-1">{config.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Phase 1: 担当者選択 */}
          {members.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <MemberSelector
                members={members}
                value={assignedTo}
                onChange={setAssignedTo}
                allowUnassigned={true}
                label="👤 Assign To"
                disabled={false}
              />
            </div>
          )}
        </section>

        {/* スケジュールセクション */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '2px solid #374151'
          }}>
            <span style={{ fontSize: '1.25rem' }}>📅</span>
            <h4 className="text-lg font-semibold text-white">Schedule</h4>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Scheduled Date <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={scheduledStartTime}
                onChange={(e) => setScheduledStartTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={scheduledEndTime}
                onChange={(e) => setScheduledEndTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* 推定時間表示 */}
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1rem' }}>⏱️</span>
            <span className="text-sm text-gray-400">Estimated Duration:</span>
            <span className="text-lg font-bold text-blue-400">{estimatedHours}h</span>
            <span className="text-sm text-gray-500">({estimatedMinutes} minutes)</span>
          </div>
        </section>

        {/* 詳細設定セクション */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '2px solid #374151'
          }}>
            <span style={{ fontSize: '1.25rem' }}>⚙️</span>
            <h4 className="text-lg font-semibold text-white">Advanced Settings</h4>
          </div>

          {!isEditMode && (
            <div style={{ 
              marginBottom: '1rem',
              padding: '1rem',
              backgroundColor: '#111827',
              border: '2px solid #374151',
              borderRadius: '0.75rem'
            }}>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <div style={{ marginLeft: '0.75rem', flex: 1 }}>
                  <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                    🔁 Repeat Weekly
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Create recurring tasks automatically
                  </div>
                </div>
              </label>
              
              {isRecurring && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #374151' }}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Repeat Until
                  </label>
                  <input
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Due Date <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              📍 Final deadline for this task
            </p>
          </div>
        </section>
      </div>

      {/* フッター（固定ボタン） */}
      <div style={{ 
        padding: '1.5rem',
        borderTop: '1px solid #374151',
        position: 'sticky',
        bottom: 0,
        backgroundColor: '#1F2937',
        display: 'flex',
        gap: '0.75rem'
      }}>
        <button
          type="submit"
          className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
        >
          {isEditMode ? (
            <>
              <span>💾</span>
              <span>Save Changes</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Create Task</span>
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}