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
  members?: string[];
  currentUserAddress?: string;
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
      setAssignedTo(editingTask.assignedTo ?? null);
    } else {
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
        assignedTo,
      };
      
      onAddTask?.(newTask);
    }
  };

  const estimatedMinutes = calculateDurationMinutes(scheduledStartTime, scheduledEndTime);
  const estimatedHours = (estimatedMinutes / 60).toFixed(1);

  return (
    <form 
      onSubmit={handleSubmit} 
      style={{
        background: 'linear-gradient(to bottom, #1F2937, #111827)',
        borderRadius: '16px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(55, 65, 81, 0.5)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* ヘッダー */}
      <div style={{ 
        padding: '1.5rem',
        borderBottom: '1px solid rgba(55, 65, 81, 0.5)',
        position: 'sticky',
        top: 0,
        background: 'linear-gradient(to right, rgba(31, 41, 55, 0.98), rgba(17, 24, 39, 0.98))',
        backdropFilter: 'blur(10px)',
        zIndex: 10,
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.25rem',
        }}>
          <span style={{ fontSize: '1.75rem' }}>{isEditMode ? '✏️' : '✨'}</span>
          <span>{isEditMode ? 'Edit Task' : 'Create New Task'}</span>
        </h3>
        <p style={{
          fontSize: '0.875rem',
          color: '#9CA3AF',
        }}>
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
            paddingBottom: '0.75rem',
            borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
          }}>
            <span style={{ fontSize: '1.25rem' }}>📝</span>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', margin: 0 }}>
              Basic Information
            </h4>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#D1D5DB',
              marginBottom: '0.5rem',
            }}>
              Task Title <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to accomplish?"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(17, 24, 39, 0.8)',
                border: '2px solid #374151',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3B82F6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#374151';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#D1D5DB',
              marginBottom: '0.5rem',
            }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, notes, or context..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(17, 24, 39, 0.8)',
                border: '2px solid #374151',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s ease',
                resize: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3B82F6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#374151';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#D1D5DB',
              marginBottom: '0.5rem',
            }}>
              Priority Level
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
            }}>
              {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => {
                const priorityConfig = {
                  low: { emoji: '🟢', gradient: 'linear-gradient(135deg, #10B981, #059669)', label: 'Low' },
                  medium: { emoji: '🟡', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', label: 'Medium' },
                  high: { emoji: '🟠', gradient: 'linear-gradient(135deg, #F97316, #EA580C)', label: 'High' },
                  urgent: { emoji: '🔴', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', label: 'Urgent' },
                };
                const config = priorityConfig[p];
                const isSelected = priority === p;
                
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      border: 'none',
                      cursor: 'pointer',
                      background: isSelected ? config.gradient : 'rgba(31, 41, 55, 0.8)',
                      color: 'white',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: isSelected 
                        ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(55, 65, 81, 0.9)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(31, 41, 55, 0.8)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{config.emoji}</div>
                    <div style={{ fontSize: '0.75rem' }}>{config.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 担当者選択 */}
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
            paddingBottom: '0.75rem',
            borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
          }}>
            <span style={{ fontSize: '1.25rem' }}>📅</span>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', margin: 0 }}>
              Schedule
            </h4>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#D1D5DB',
              marginBottom: '0.5rem',
            }}>
              Scheduled Date <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(17, 24, 39, 0.8)',
                border: '2px solid #374151',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3B82F6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#374151';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#D1D5DB',
                marginBottom: '0.5rem',
              }}>
                Start Time
              </label>
              <input
                type="time"
                value={scheduledStartTime}
                onChange={(e) => setScheduledStartTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(17, 24, 39, 0.8)',
                  border: '2px solid #374151',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#374151';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#D1D5DB',
                marginBottom: '0.5rem',
              }}>
                End Time
              </label>
              <input
                type="time"
                value={scheduledEndTime}
                onChange={(e) => setScheduledEndTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(17, 24, 39, 0.8)',
                  border: '2px solid #374151',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#374151';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* 推定時間表示 */}
          <div style={{
            padding: '1rem',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>⏱️</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Estimated Duration</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#60A5FA' }}>
                  {estimatedHours}h
                </span>
                <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                  ({estimatedMinutes} minutes)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 詳細設定セクション */}
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
          }}>
            <span style={{ fontSize: '1.25rem' }}>⚙️</span>
            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'white', margin: 0 }}>
              Advanced Settings
            </h4>
          </div>

          {!isEditMode && (
            <div style={{ 
              marginBottom: '1rem',
              padding: '1rem',
              background: 'rgba(17, 24, 39, 0.6)',
              border: '2px solid #374151',
              borderRadius: '10px',
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    marginTop: '0.125rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ marginLeft: '0.75rem', flex: 1 }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: 'white',
                    marginBottom: '0.25rem',
                  }}>
                    🔁 Repeat Weekly
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                    Create recurring tasks automatically
                  </div>
                </div>
              </label>
              
              {isRecurring && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #374151' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#D1D5DB',
                    marginBottom: '0.5rem',
                  }}>
                    Repeat Until
                  </label>
                  <input
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'rgba(17, 24, 39, 0.8)',
                      border: '2px solid #374151',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3B82F6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#374151';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          )}
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#D1D5DB',
              marginBottom: '0.5rem',
            }}>
              Due Date <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(17, 24, 39, 0.8)',
                border: '2px solid #374151',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3B82F6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#374151';
                e.target.style.boxShadow = 'none';
              }}
            />
            <p style={{
              fontSize: '0.75rem',
              color: '#9CA3AF',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}>
              <span>📍</span>
              <span>Final deadline for this task</span>
            </p>
          </div>
        </section>
      </div>

      {/* フッター（固定ボタン） */}
      <div style={{ 
        padding: '1.5rem',
        borderTop: '1px solid rgba(55, 65, 81, 0.5)',
        position: 'sticky',
        bottom: 0,
        background: 'linear-gradient(to right, rgba(31, 41, 55, 0.98), rgba(17, 24, 39, 0.98))',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        gap: '0.75rem',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
      }}>
        <button
          type="submit"
          style={{
            flex: 1,
            padding: '0.875rem 1.5rem',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: 'white',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>{isEditMode ? '💾' : '✨'}</span>
          <span>{isEditMode ? 'Save Changes' : 'Create Task'}</span>
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.875rem 1.5rem',
              background: 'rgba(55, 65, 81, 0.8)',
              color: 'white',
              borderRadius: '10px',
              fontWeight: '600',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(75, 85, 99, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(55, 65, 81, 0.8)';
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}