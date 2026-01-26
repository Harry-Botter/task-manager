import TaskForm from './TaskForm';
import { Task } from '../lib/types';

interface TaskEditModalProps {
  task: Task;
  onEditTask: (task: Task) => void;
  onClose: () => void;
  members?: string[]; // Phase 1: メンバーリスト
}

export default function TaskEditModal({ 
  task, 
  onEditTask, 
  onClose,
  members = [],
}: TaskEditModalProps) {
  const handleEdit = (updatedTask: Task) => {
    // Phase 1: 担当者が変更されたか判定
    const assignedToChanged = task.assignedTo !== updatedTask.assignedTo;
    
    if (assignedToChanged) {
      // 担当者変更を検知（ここで将来的にトランザクション処理を追加可能）
      console.log(
        `担当者が変更されました: ${task.assignedTo ?? 'Unassigned'} → ${updatedTask.assignedTo ?? 'Unassigned'}`
      );
    }
    
    onEditTask(updatedTask);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem',
      }}
      onClick={onClose}
      role='dialog'
      aria-modal='true'
    >
      <div
        style={{
          backgroundColor: '#1F2937',
          borderRadius: '0.5rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <TaskForm 
          editingTask={task} 
          onEditTask={handleEdit} 
          onCancel={onClose}
          members={members}
        />
      </div>
    </div>
  );
}