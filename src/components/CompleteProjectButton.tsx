import { Project, Task } from '../lib/types';
import { calculateContribution } from '../lib/contribution';

interface CompleteProjectButtonProps {
  project: Project;
  tasks: Task[];
  onComplete: () => void;
  isConnected: boolean;
}

export default function CompleteProjectButton({
  project,
  tasks,
  onComplete,
  isConnected,
}: CompleteProjectButtonProps) {
  if (project.status === 'completed') {
    return (
      <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-green-400">✓ Project Completed</h3>
            <p className="text-sm text-gray-400">
              Completed on {new Date(project.completedAt!).toLocaleDateString()}
            </p>
            {project.nftMinted && (
              <p className="text-sm text-purple-400 mt-1">🏆 NFT Certificate Minted</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const contribution = calculateContribution(tasks);
  const canComplete = contribution.completedTasks > 0;

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
      <h3 className="font-bold text-white mb-3">Project Summary</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <span className="text-gray-400">Completion Rate:</span>
          <span className="ml-2 font-bold text-white">
            {contribution.totalTasks > 0
              ? Math.round((contribution.completedTasks / contribution.totalTasks) * 100)
              : 0}
            %
          </span>
        </div>
        <div>
          <span className="text-gray-400">Contribution Score:</span>
          <span className="ml-2 font-bold text-purple-400">
            {contribution.contributionScore}
          </span>
        </div>
      </div>

      {!isConnected && (
        <div className="text-sm text-yellow-400 mb-3">
          ⚠️ Connect wallet to mint NFT certificate
        </div>
      )}

      <button
        onClick={onComplete}
        disabled={!canComplete || !isConnected}
        className={`w-full py-3 rounded-lg font-bold transition-colors ${
          canComplete && isConnected
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {canComplete
          ? '🏆 Complete Project & Mint NFT'
          : 'Complete at least 1 task to mint NFT'}
      </button>
    </div>
  );
}