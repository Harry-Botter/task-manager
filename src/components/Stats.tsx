import { Task } from '../lib/types';
import { calculateContribution } from '../lib/contribution';
import { formatMinutes } from '../lib/contribution';

interface StatsProps {
  tasks: Task[];
}

export default function Stats({ tasks }: StatsProps) {
  const contribution = calculateContribution(tasks);
  const inProgress = tasks.filter((t) => t.status === 'in-progress').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="text-2xl font-bold text-white">{tasks.length}</div>
        <div className="text-sm text-gray-400">Total Tasks</div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="text-2xl font-bold text-blue-400">{inProgress}</div>
        <div className="text-sm text-gray-400">In Progress</div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="text-2xl font-bold text-green-400">
          {contribution.completedTasks}
        </div>
        <div className="text-sm text-gray-400">Completed</div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="text-2xl font-bold text-purple-400">
          {contribution.contributionScore}
        </div>
        <div className="text-sm text-gray-400">Score</div>
      </div>
    </div>
  );
}