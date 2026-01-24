import { useState, useEffect } from 'react';
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { mintProjectCompletionNFT } from './lib/sui';
import Sidebar from './components/Sidebar';
import WeeklyChart from './components/WeeklyChart';
import TaskFormModal from './components/TaskFormModal';
import TaskEditModal from './components/TaskEditModal';
import NetworkSelector from './components/NetworkSelector';
import ConnectionDebugger from './components/ConnectionDebugger';
import { generateRecurringTasks } from './lib/recurringTasks';
import CompleteTaskModal from './components/CompleteTaskModal';
import { Task, Project, TaskStatus } from './lib/types';
import { storage } from './lib/storage';
import TaskTable from './components/TaskTable';
import GanttCharrt from './components/GanttChart';

type FilterType = 'all' | 'today' | 'pending' | 'in-progress' | 'completed';

function App() {
  const [project, setProject] = useState<Project>(storage.getProject());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const account = useCurrentAccount();
  const signAndExecute = useSignAndExecuteTransaction();

  useEffect(() => {
    const loadedTasks = storage.getTasks();
    const migratedTasks = loadedTasks.map((task) => ({
      ...task,
      scheduledDate: task.scheduledDate || task.startDate,
      scheduledStartTime: task.scheduledStartTime || '09:00',
      scheduledEndTime: task.scheduledEndTime || '13:00',
      isRecurring: task.isRecurring || false,
    }));

    setTasks(migratedTasks);
    storage.saveTasks(migratedTasks);
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    storage.saveTasks(newTasks);
  };

  const addTask = (task: Task) => {
    const tasksToAdd = generateRecurringTasks(task);
    saveTasks([...tasks, ...tasksToAdd]);
    setIsAddingTask(false);
  };

  const editTask = (updatedTask: Task) => {
    saveTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setEditingTaskId(null);
  };

  const deleteTask = (taskId: string) => {
    if (confirm('Delete this task?')) {
      saveTasks(tasks.filter((t) => t.id !== taskId));
    }
  };

  const changeStatus = (taskId: string, status: TaskStatus) => {
    saveTasks(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)));
  };

  const handleCompleteClick = (taskId: string) => {
    setCompletingTaskId(taskId);
  };

  const handleCompleteConfirm = (actualTime: number) => {
    if (!completingTaskId) return;
    saveTasks(
      tasks.map((task) =>
        task.id === completingTaskId
          ? { ...task, status: 'completed' as const, completedAt: Date.now(), actualTime }
          : task
      )
    );
    setCompletingTaskId(null);
  };

  const completeProject = async () => {
    if (!account) {
      alert('⚠️ Please connect your wallet first!');
      return;
    }

    console.log('Account:', account);
    console.log('Account Address:', account.address);

    if (!account.address) {
      alert('❌ Wallet address not found. Please reconnect your wallet.');
      return;
    }

    try {
      const digest = await mintProjectCompletionNFT({
        project,
        tasks,
        signAndExecute: signAndExecute.mutateAsync,
        currentAddress: account.address,
      });

      alert(`🎉 Project completed!\nTransaction: ${digest}`);

      const updatedProject: Project = {
        ...project,
        status: 'completed',
        completedAt: Date.now(),
        nftMinted: true,
        nftObjectId: digest,
      };

      setProject(updatedProject);
      storage.saveProject(updatedProject);
    } catch (error) {
      console.error('NFT minting failed:', error);
      alert(`❌ NFT mint failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getFilteredTasks = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'today':
        return tasks.filter((t) => {
          const taskScheduled = new Date(t.scheduledDate).setHours(0, 0, 0, 0);
          return taskScheduled === today && t.status !== 'completed';
        });
      case 'pending':
        return tasks.filter((t) => t.status === 'pending');
      case 'in-progress':
        return tasks.filter((t) => t.status === 'in-progress');
      case 'completed':
        return tasks.filter((t) => t.status === 'completed');
      default:
        return tasks;
    }
  };

  const sortedTasks = [...getFilteredTasks()].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return a.dueDate - b.dueDate;
  });

  const completingTask = completingTaskId ? tasks.find((t) => t.id === completingTaskId) : null;
  const editingTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : null;

  const filterCounts = {
    all: tasks.length,
    today: tasks.filter((t) => {
      const today = new Date().setHours(0, 0, 0, 0);
      const taskScheduled = new Date(t.scheduledDate).setHours(0, 0, 0, 0);
      return taskScheduled === today && t.status !== 'completed';
    }).length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#111827', color: 'white' }}>
      <header style={{ borderBottom: '1px solid #374151', backgroundColor: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)' }}>
        <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Suilog</h1>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Task Management & Contribution Tracker</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <NetworkSelector />
            <ConnectButton />
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          tasks={tasks}
          project={project}
          onCompleteProject={completeProject}
          onAddTask={() => setIsAddingTask(true)}
          isConnected={!!account}
        />

        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <WeeklyChart tasks={tasks} />
          </div>

          <GanttCharrt tasks={tasks} />

          <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['all', 'today', 'pending', 'in-progress', 'completed'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  backgroundColor: filter === f ? '#2563EB' : '#374151',
                  color: 'white',
                  transition: 'all 0.2s',
                }}
              >
                {f === 'all' ? 'All' : f === 'today' ? 'Today' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
                <span style={{ marginLeft: '0.25rem', opacity: 0.7 }}>({filterCounts[f]})</span>
              </button>
            ))}
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
              {filter === 'all' ? 'All Tasks' : filter === 'today' ? "Today's Tasks" : filter === 'in-progress' ? 'In Progress Tasks' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks`}
            </h2>
            
            <TaskTable
              tasks={sortedTasks}
              onComplete={handleCompleteClick}
              onEdit={(taskId) => setEditingTaskId(taskId)}
              onDelete={deleteTask}
              onStatusChange={changeStatus}
            />
          </div>
        </main>
      </div>

      {isAddingTask && (
        <TaskFormModal
          onAddTask={addTask}
          onClose={() => setIsAddingTask(false)}
        />
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onEditTask={editTask}
          onClose={() => setEditingTaskId(null)}
        />
      )}

      {completingTask && (
        <CompleteTaskModal
          taskTitle={completingTask.title}
          estimatedTime={completingTask.estimatedTime}
          onConfirm={handleCompleteConfirm}
          onCancel={() => setCompletingTaskId(null)}
        />
      )}

      {/* デバッグ情報 */}
      <ConnectionDebugger />
    </div>
  );
}

export default App;