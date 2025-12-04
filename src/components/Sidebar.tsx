import { useState, useEffect } from 'react';
import { Task, Project } from '../lib/types';
import { calculateContribution } from '../lib/contribution';
import CompleteProjectButton from './CompleteProjectButton';

interface SidebarProps {
  tasks: Task[];
  project: Project;
  onCompleteProject: () => void;
  onAddTask: () => void; // ← 追加
  isConnected: boolean;
}

export default function Sidebar({ tasks, project, onCompleteProject, onAddTask, isConnected }: SidebarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const contribution = calculateContribution(tasks);
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;

  const today = new Date().setHours(0, 0, 0, 0);
  const todaysDueTasks = tasks.filter(
    (t) => t.status !== 'completed' && new Date(t.scheduledDate).setHours(0, 0, 0, 0) === today
  ).length;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <div style={{ width: '20rem', backgroundColor: '#1F2937', borderRight: '1px solid #374151', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 日時情報 */}
      <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #374151' }}>
        <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'white', marginBottom: '0.5rem' }}>
          {formatTime(currentTime)}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
          {formatDate(currentTime)}
        </div>
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #374151' }}>
          <div style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>今日の作業予定</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#60A5FA' }}>
            {todaysDueTasks} タスク
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #374151' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white', marginBottom: '0.75rem' }}>
          📈 Statistics
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Total Tasks</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'white' }}>{tasks.length}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>In Progress</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#60A5FA' }}>{inProgress}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Completed</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#34D399' }}>{contribution.completedTasks}</span>
          </div>
          
          <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #374151' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Contribution Score</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#A78BFA' }}>{contribution.contributionScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task ボタン - 追加 */}
      <button
        onClick={onAddTask}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#2563EB',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
      >
        + Add Task
      </button>

      {/* プロジェクト完了ボタン */}
      <div style={{ marginTop: 'auto' }}>
        <CompleteProjectButton
          project={project}
          tasks={tasks}
          onComplete={onCompleteProject}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}