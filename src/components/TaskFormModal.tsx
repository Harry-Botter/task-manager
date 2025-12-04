import TaskForm from './TaskForm';
import { Task } from '../lib/types';

interface TaskFormModalProps {
  onAddTask: (task: Task) => void;
  onClose: () => void;
}

export default function TaskFormModal({ onAddTask, onClose }: TaskFormModalProps) {
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
        <TaskForm onAddTask={onAddTask} onCancel={onClose} />
      </div>
    </div>
  );
}