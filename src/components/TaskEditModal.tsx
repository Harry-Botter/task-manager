import TaskForm from './TaskForm';
import { Task } from '../lib/types';

interface TaskEditModalProps {
  task: Task;
  onEditTask: (task: Task) => void;
  onClose: () => void;
}

export default function TaskEditModal({ task, onEditTask, onClose }: TaskEditModalProps) {
  const handleEdit = (updatedTask: Task) => {
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
        />
      </div>
    </div>
  );
}