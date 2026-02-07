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
import { Task, Project, TaskStatus, FilterType } from './lib/types';
import { storage } from './lib/storage';
import TaskTable from './components/TaskTable';
import GanttCharrt from './components/GanttChart';
import { TaskFilterBar } from './components/TaskFilterBar';
import { addressesEqual } from './lib/utils'; // ← 追加

// Phase 1: テスト用メンバーアドレス
const SAMPLE_MEMBERS = [
  '0xd07c64dd6e6866e4386fc5708989dfe76b15c85ad755373f6c85bfb8a1c94dd0',
  '0x1234567890abcdef1234567890abcdef12345678',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
];

function App() {
  const [project, setProject] = useState<Project>(() => {
    const stored = storage.getProject();
    
    if (!stored.members || stored.members.length === 0) {
      const initialProject: Project = {
        ...stored,
        members: SAMPLE_MEMBERS,
      };
      storage.saveProject(initialProject);
      console.log('✅ Initialized project with SAMPLE_MEMBERS:', SAMPLE_MEMBERS);
      return initialProject;
    }
    
    return {
      ...stored,
      members: stored.members,
    };
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string | null>(null);
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
      assignedTo: task.assignedTo ?? null,
    }));

    setTasks(migratedTasks);
    storage.saveTasks(migratedTasks);
    
    console.log('✅ Loaded tasks:', migratedTasks.length);
    console.log('📋 Tasks:', migratedTasks);
    console.log('👥 Project members:', project.members);
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

  /**
   * タスクをフィルター条件に基づいて絞り込む
   * ✅ アドレス正規化を適用
   */
  const getFilteredTasks = (): Task[] => {
    const today = new Date().setHours(0, 0, 0, 0);
    
    let filtered = tasks;
    
    if (filter === 'today') {
      filtered = tasks.filter((t) => {
        const taskScheduled = new Date(t.scheduledDate).setHours(0, 0, 0, 0);
        return taskScheduled === today && t.status !== 'completed';
      });
    } else if (filter === 'pending') {
      filtered = tasks.filter((t) => t.status === 'pending');
    } else if (filter === 'in-progress') {
      filtered = tasks.filter((t) => t.status === 'in-progress');
    } else if (filter === 'completed') {
      filtered = tasks.filter((t) => t.status === 'completed');
    } else if (filter === 'myTasks') {
      // ✅ アドレス正規化を使用
      filtered = tasks.filter((t) => addressesEqual(t.assignedTo, account?.address));
    } else if (filter === 'unassigned') {
      filtered = tasks.filter((t) => t.assignedTo === null);
    } else if (filter === 'byMember' && selectedMemberFilter) {
      // ✅ アドレス正規化を使用
      filtered = tasks.filter((t) => addressesEqual(t.assignedTo, selectedMemberFilter));
    }
    
    return filtered;
  };

  const sortedTasks = [...getFilteredTasks()].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return a.dueDate - b.dueDate;
  });

  /**
   * ✅ filterCounts を計算（TaskFilterBar に渡すため）
   * ✅ アドレス正規化を適用
   */
  const filterCounts: Record<string, number> = {
    all: tasks.length,
    today: tasks.filter((t) => {
      const today = new Date().setHours(0, 0, 0, 0);
      const taskScheduled = new Date(t.scheduledDate).setHours(0, 0, 0, 0);
      return taskScheduled === today && t.status !== 'completed';
    }).length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    // ✅ アドレス正規化を使用
    myTasks: tasks.filter((t) => addressesEqual(t.assignedTo, account?.address)).length,
    unassigned: tasks.filter((t) => t.assignedTo === null).length,
    byMember: selectedMemberFilter
      // ✅ アドレス正規化を使用
      ? tasks.filter((t) => addressesEqual(t.assignedTo, selectedMemberFilter)).length
      : 0,

    // ✅ メンバーごとのタスク数も計算（アドレス正規化を適用）
    ...Object.fromEntries(
      (project.members || []).map((member) => [
        member,
        tasks.filter((t) => addressesEqual(t.assignedTo, member)).length,
      ])
    ),
  };

  const completingTask = completingTaskId ? tasks.find((t) => t.id === completingTaskId) : null;
  const editingTask = editingTaskId ? tasks.find((t) => t.id === editingTaskId) : null;

  /**
   * フィルター変更ハンドラー
   * ✅ ウォレット未接続時の防御を追加
   */
  const handleFilterChange = (newFilter: FilterType, member?: string) => {
    // My Tasks はウォレット未接続時は無効化
    if (newFilter === 'myTasks' && !account?.address) {
      alert('⚠️ Please connect your wallet to use "My Tasks" filter');
      return; // フィルター変更をキャンセル
    }
    
    setFilter(newFilter);
    if (member) {
      setSelectedMemberFilter(member);
    } else if (newFilter !== 'byMember') {
      setSelectedMemberFilter(null);
    }
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
          onAddTask={() => {
            console.log('🔷 Add Task clicked');
            setIsAddingTask(true);
          }}
          isConnected={!!account}
          currentUserAddress={account?.address}
          onUpdateProject={setProject}
        />

        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <WeeklyChart tasks={tasks} />
          </div>

          <GanttCharrt tasks={tasks} />

          {/* ✅ Phase 1: TaskFilterBar を統合 */}
          <TaskFilterBar
            currentFilter={filter}
            members={project.members || []}
            selectedMember={selectedMemberFilter}
            filterCounts={filterCounts}
            onFilterChange={handleFilterChange}
            currentUserAddress={account?.address}
          />

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
              {filter === 'all' && 'All Tasks'}
              {filter === 'today' && "Today's Tasks"}
              {filter === 'in-progress' && 'In Progress Tasks'}
              {filter === 'pending' && 'Pending Tasks'}
              {filter === 'completed' && 'Completed Tasks'}
              {filter === 'myTasks' && '👤 My Tasks'}
              {filter === 'unassigned' && '✨ Unassigned Tasks'}
              {filter === 'byMember' && selectedMemberFilter && `Tasks for ${selectedMemberFilter.slice(0, 6)}...`}
            </h2>
            
            {sortedTasks.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#9CA3AF',
                backgroundColor: '#1F2937',
                borderRadius: '0.5rem',
              }}>
                <p>📭 No tasks found</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Click "Add Task" to create your first task
                </p>
              </div>
            ) : (
              <TaskTable
                tasks={sortedTasks}
                onComplete={handleCompleteClick}
                onEdit={(taskId) => setEditingTaskId(taskId)}
                onDelete={deleteTask}
                onStatusChange={changeStatus}
              />
            )}
          </div>
        </main>
      </div>

      {isAddingTask && (
        <TaskFormModal
          onAddTask={addTask}
          onClose={() => {
            console.log('🔷 TaskFormModal closed');
            setIsAddingTask(false);
          }}
          members={project.members || []}
          currentUserAddress={account?.address}
        />
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onEditTask={editTask}
          onClose={() => {
            console.log('🔷 TaskEditModal closed');
            setEditingTaskId(null);
          }}
          members={project.members || []}
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

      <ConnectionDebugger />
    </div>
  );
}

export default App;