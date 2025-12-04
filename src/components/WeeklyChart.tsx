import { Task } from '../lib/types';
import { calculateWeeklySchedule, formatMinutes } from '../lib/contribution';
import { useState } from 'react';

interface WeeklyChartProps {
  tasks: Task[];
}

export default function WeeklyChart({ tasks }: WeeklyChartProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const scheduleData = calculateWeeklySchedule(tasks);
  
  const maxMinutes = Math.max(
    ...scheduleData.map((d) => Math.max(d.scheduledMinutes, d.actualMinutes)),
    480
  );
  const chartHeight = 200;
  
  // Y軸のラベルを動的に生成
  const maxHours = Math.ceil(maxMinutes / 60);
  const yAxisStep = maxHours <= 8 ? 2 : Math.ceil(maxHours / 4); // 最大4-5個のラベル
  const yAxisLabels: number[] = [];
  for (let i = 0; i <= maxHours; i += yAxisStep) {
    yAxisLabels.push(i);
  }

  return (
    <div style={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '0.5rem', padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: 'white' }}>
        📊 Weekly Schedule (Next 14 Days)
      </h2>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Y軸 - 動的生成 */}
        <div style={{ display: 'flex', flexDirection: 'column-reverse', justifyContent: 'space-between', height: `${chartHeight}px`, paddingTop: '0.5rem' }}>
          {yAxisLabels.map((hour) => (
            <div key={hour} style={{ fontSize: '0.75rem', color: '#6B7280', textAlign: 'right', width: '2rem' }}>
              {hour}h
            </div>
          ))}
        </div>
        
        {/* グラフエリア */}
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: `${chartHeight}px`, gap: '0.5rem', position: 'relative' }}>
            {/* 8時間ライン */}
            <div
              style={{
                position: 'absolute',
                bottom: `${(480 / maxMinutes) * chartHeight}px`,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: '#EF4444',
                opacity: 0.7,
              }}
            />
            
            {scheduleData.map((day, index) => {
              const scheduledHeight = maxMinutes > 0 ? (day.scheduledMinutes / maxMinutes) * chartHeight : 0;
              const actualHeight = maxMinutes > 0 ? (day.actualMinutes / maxMinutes) * chartHeight : 0;
              const isHovered = hoveredDay === index;
              
              return (
                <div
                  key={day.date}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
                  onMouseEnter={() => setHoveredDay(index)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* ツールチップ */}
                  {isHovered && (
                    <div
                      style={{
                        position: 'fixed',
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '0.375rem',
                        padding: '0.75rem',
                        fontSize: '0.75rem',
                        color: 'white',
                        whiteSpace: 'nowrap',
                        zIndex: 1000,
                        minWidth: '200px',
                        pointerEvents: 'none',
                        transform: 'translate(-50%, -110%)',
                        left: '50%',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{day.date} ({day.dayOfWeek})</div>
                      
                      <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ color: '#9CA3AF', fontSize: '0.7rem' }}>Scheduled:</div>
                        <div style={{ color: '#6B7280' }}>{formatMinutes(day.scheduledMinutes)}</div>
                        {day.scheduledTasks.slice(0, 3).map((task) => (
                          <div key={task.id} style={{ fontSize: '0.65rem', color: '#6B7280', marginLeft: '0.5rem' }}>
                            • {task.title} {task.scheduledStartTime}-{task.scheduledEndTime}
                          </div>
                        ))}
                        {day.scheduledTasks.length > 3 && (
                          <div style={{ fontSize: '0.65rem', color: '#6B7280', marginLeft: '0.5rem' }}>
                            ... +{day.scheduledTasks.length - 3} more
                          </div>
                        )}
                      </div>
                      
                      {day.actualMinutes > 0 && (
                        <div>
                          <div style={{ color: '#9CA3AF', fontSize: '0.7rem' }}>Actual:</div>
                          <div style={{ color: '#60A5FA' }}>{formatMinutes(day.actualMinutes)}</div>
                          {day.completedTasks.slice(0, 3).map((task) => (
                            <div key={task.id} style={{ fontSize: '0.65rem', color: '#60A5FA', marginLeft: '0.5rem' }}>
                              • {task.title} ✓
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 棒グラフ: 予定(背景) */}
                  {scheduledHeight > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        height: `${scheduledHeight}px`,
                        backgroundColor: '#4B5563',
                        borderRadius: '0.25rem 0.25rem 0 0',
                        opacity: 0.5,
                      }}
                    />
                  )}
                  
                  {/* 棒グラフ: 実績(前面) */}
                  {actualHeight > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '80%',
                        height: `${actualHeight}px`,
                        backgroundColor: day.actualMinutes > 480 ? '#EF4444' : '#60A5FA',
                        borderRadius: '0.25rem 0.25rem 0 0',
                        transition: 'all 0.2s',
                        opacity: isHovered ? 1 : 0.8,
                      }}
                    />
                  )}
                  
                  {/* 曜日ラベル */}
                  <div
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: day.isToday ? '#60A5FA' : '#9CA3AF',
                      fontWeight: day.isToday ? 'bold' : 'normal',
                    }}
                  >
                    {day.dayOfWeek}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>
                    {new Date(day.date).getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* 凡例 */}
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#9CA3AF', flexWrap: 'wrap', marginLeft: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1rem', height: '0.5rem', backgroundColor: '#4B5563', opacity: 0.5, borderRadius: '0.125rem' }} />
          <span>Scheduled</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1rem', height: '0.5rem', backgroundColor: '#60A5FA', borderRadius: '0.125rem' }} />
          <span>Actual</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1rem', height: '2px', backgroundColor: '#EF4444' }} />
          <span>8h threshold</span>
        </div>
      </div>
    </div>
  );
}