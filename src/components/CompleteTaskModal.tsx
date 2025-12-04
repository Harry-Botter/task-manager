import { useState } from 'react';
import { formatMinutes } from '../lib/contribution';

interface CompleteTaskModalProps {
  taskTitle: string;
  estimatedTime: number;
  onConfirm: (actualTime: number) => void;
  onCancel: () => void;
}

export default function CompleteTaskModal({
  taskTitle,
  estimatedTime,
  onConfirm,
  onCancel,
}: CompleteTaskModalProps) {
  const [actualTime, setActualTime] = useState(estimatedTime);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-4">Complete Task</h3>
        <p className="text-gray-300 mb-4">"{taskTitle}"</p>
        
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Actual Time Spent (minutes)
        </label>
        <input
          type="number"
          value={actualTime}
          onChange={(e) => setActualTime(Math.max(15, Number(e.target.value)))}
          min="15"
          step="15"
          className="w-full px-4 py-2 mb-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <p className="text-xs text-gray-500 mb-4">
          Estimated: {formatMinutes(estimatedTime)}
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(actualTime)}
            className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Complete Task
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}