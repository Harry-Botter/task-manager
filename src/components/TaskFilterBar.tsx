import { useState, useRef, useEffect } from "react";

type FilterType = 'all' | 'myTasks' | 'unassigned' | 'byMember';

interface TaskFilterBarProps {
    currentFilter: FilterType;
    members: string[];
    selectedMember?: string | null;
    filterCounts: {
        all: number;
        myTasks: number;
        unassigned: number;
        [key: string]: number
    };
    onFilterChange: (filter: FilterType, member?: string) => void;
}

/* ウォレットアドレスを短縮形で表示 */
const truncateAddress = (address: string): string => {
    if(!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const TaskFilterBar = ({
    currentFilter,
    members,
    selectedMember,
    filterCounts,
    onFilterChange,
}: TaskFilterBarProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    
    // ドロップダウン外クリック時に閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterSelect = (filter: FilterType, member?: string) => {
    onFilterChange(filter, member);
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-gray-900 border-b border-gray-700 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {/* All Tasks タブ */}
        <button
          onClick={() => handleFilterSelect('all')}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${
              currentFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }
          `}
        >
          📋 All Tasks <span className="ml-1 text-sm">({filterCounts.all})</span>
        </button>

        {/* My Tasks タブ */}
        <button
          onClick={() => handleFilterSelect('myTasks')}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${
              currentFilter === 'myTasks'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }
          `}
        >
          👤 My Tasks <span className="ml-1 text-sm">({filterCounts.myTasks})</span>
        </button>

        {/* Unassigned タブ */}
        <button
          onClick={() => handleFilterSelect('unassigned')}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${
              currentFilter === 'unassigned'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }
          `}
        >
          ✨ Unassigned <span className="ml-1 text-sm">({filterCounts.unassigned})</span>
        </button>

        {/* By Member ドロップダウン */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
              ${
                currentFilter === 'byMember'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }
            `}
          >
            <span>👥 By Member</span>
            {selectedMember && <span className="text-sm">({truncateAddress(selectedMember)})</span>}
            <svg
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {/* メンバー選択ドロップダウン */}
          {isDropdownOpen && (
            <div className="absolute z-50 top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg w-56">
              {members.length > 0 ? (
                members.map((member) => {
                  const memberTaskCount = filterCounts[member] || 0;
                  return (
                    <button
                      key={member}
                      onClick={() => handleFilterSelect('byMember', member)}
                      className={`
                        w-full px-4 py-2 text-left text-sm transition-colors
                        hover:bg-gray-700
                        ${selectedMember === member ? 'bg-blue-600 text-white' : 'text-gray-300'}
                        ${members.indexOf(member) < members.length - 1 ? 'border-b border-gray-700' : ''}
                      `}
                      title={member}
                    >
                      <span className="flex justify-between items-center">
                        <span>👤 {truncateAddress(member)}</span>
                        <span className="text-xs opacity-75">({memberTaskCount})</span>
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No members available
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* フィルター情報表示 */}
      <div className="mt-3 text-xs text-gray-500">
        {currentFilter === 'all' && '全てのタスクを表示中'}
        {currentFilter === 'myTasks' && 'あなたに割り当てられたタスクを表示中'}
        {currentFilter === 'unassigned' && '未割り当てのタスクを表示中'}
        {currentFilter === 'byMember' && selectedMember && (
          <>
            <span>{truncateAddress(selectedMember)} に割り当てられたタスクを表示中</span>
            <button
              onClick={() => handleFilterSelect('all')}
              className="ml-2 text-blue-400 hover:text-blue-300 underline"
            >
              リセット
            </button>
          </>
        )}
      </div>
    </div>
  );
};