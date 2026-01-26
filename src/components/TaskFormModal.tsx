import TaskForm from './TaskForm';
import { Task } from '../lib/types';

interface TaskFormModalProps {
  onAddTask?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onClose?: () => void;
  editingTask?: Task;
  members?: string[]; // Phase 1: メンバーリスト追加
  currentUserAddress?: string; // Phase 1: 現在のウォレットアドレス追加
}

export default function TaskFormModal({ 
  onAddTask, 
  onEditTask, 
  onClose, 
  editingTask,
  members = [],
  currentUserAddress,
}: TaskFormModalProps) {
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
          onAddTask={onAddTask} 
          onEditTask={onEditTask}
          onCancel={onClose}
          editingTask={editingTask}
          members={members}
          currentUserAddress={currentUserAddress}
        />
      </div>
    </div>
  );
}