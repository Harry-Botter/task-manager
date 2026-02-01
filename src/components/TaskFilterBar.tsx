import { useState, useRef, useEffect } from "react";
import { FilterType } from "../lib/types";

interface TaskFilterBarProps {
    currentFilter: FilterType;
    members: string[];
    selectedMember?: string | null;
    filterCounts: Record<string, number>;
    onFilterChange: (filter: FilterType, member?: string) => void;
    currentUserAddress?: string;
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
    currentUserAddress,
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

  const isWalletConnected = !!currentUserAddress;

  return (
    <div style={{
      background: 'linear-gradient(to bottom, rgba(17, 24, 39, 0.95), rgba(31, 41, 55, 0.95))',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '1.5rem',
      border: '1px solid rgba(55, 65, 81, 0.5)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    }}>
      {/* 1段のタブバー */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'nowrap',
      }}>
        {/* All Tasks タブ */}
        <button
          onClick={() => handleFilterSelect('all')}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            background: currentFilter === 'all'
             ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
             : 'rgba(31, 41, 55, 0.8)',
            color: currentFilter === 'all' ? 'white' : '#D1D5DB',
            boxShadow: currentFilter === 'all'
             ? '0 4px 12px rgba(59, 130, 246, 0.4)'
             : 'none',
          }}
          onMouseEnter={(e) => {
            if (currentFilter !== 'all') {
              e.currentTarget.style.background = 'rgba(55, 65, 81, 0.9)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentFilter !== 'all') {
              e.currentTarget.style.background = 'rgba(31, 41, 55, 0.8)';
            }
          }}
        >
          <span>📋</span>
          <span>All Tasks</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            background: currentFilter === 'all'
             ? 'rgba(255, 255, 255, 0.2)'
             : 'rgba(17, 24, 39, 0.6)',
          }}>
            {filterCounts.all}
          </span>
        </button>

        {/* My Tasks タブ */}
        <button
          onClick={() => {
            if (!isWalletConnected) {
              alert('⚠️ Please connect your wallet to use "My Tasks" filter');
              return
            }
            handleFilterSelect('myTasks');
          }}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            background: currentFilter === 'myTasks'
             ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
             : isWalletConnected
              ? 'rgba(31, 41, 55, 0.8)'
              : 'rgba(55, 65, 81, 0.4)',
            color: isWalletConnected ? (currentFilter === 'myTasks' ? 'white' : '#D1D5DB') : '#6B7280',
            boxShadow: currentFilter === 'myTasks'
             ? '0 4px 12px rgba(59, 130, 246, 0.4)'
             : 'none',
            filter: isWalletConnected ? 'none' : 'grayscale(100%)'
          }}
          onMouseEnter={(e) => {
            if (isWalletConnected && currentFilter !== 'myTasks') {
              e.currentTarget.style.background = 'rgba(55, 65, 81, 0.9)';
            } else if (!isWalletConnected) {
              e.currentTarget.style.background = 'rgba(75, 85, 99, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (isWalletConnected && currentFilter !== 'myTasks') {
              e.currentTarget.style.background = 'rgba(31, 41, 55, 0.8)';
            } else if (!isWalletConnected) {
              e.currentTarget.style.background = 'rgba(55, 65, 81, 0.4)';
            }
          }}
         >
          {isWalletConnected ? <span>👤</span> : <span>🔒</span>}
          <span>My Tasks</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            background: currentFilter === 'myTasks' 
              ? 'rgba(255, 255, 255, 0.2)' 
              : 'rgba(17, 24, 39, 0.6)',
          }}>
            {filterCounts.myTasks}
          </span>
        </button>

        {/* Unassigned タブ */}
        <button
          onClick={() => handleFilterSelect('unassigned')}
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            background: currentFilter === 'unassigned'
             ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
             : 'rgba(31, 41, 55, 0.8)',
            color: currentFilter === 'unassigned' ? 'white' : '#D1D5DB',
            boxShadow: currentFilter === 'unassigned'
             ? '0 4px 12px rgba(59, 130, 246, 0.4)'
             : 'none',
          }}
          onMouseEnter={(e) => {
            if (currentFilter !== 'unassigned') {
              e.currentTarget.style.background = 'rgba(55, 65, 81, 0.9)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentFilter !== 'unassigned') {
              e.currentTarget.style.background = 'rgba(31, 41, 55, 0.8)';
            }
          }}
         >
          <span>✨</span>
          <span>Unassigned</span>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            background: currentFilter === 'unassigned'
             ? 'rgba(255, 255, 255, 0.2)'
             : 'rgba(17, 24, 39, 0.6)',
          }}>
            {filterCounts.unassigned}
          </span>
        </button>

        {/* Member Filter Dropdown */}
        <div style={{position: 'relative'}} ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              background: currentFilter === 'byMember'
              ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
              : 'rgba(31, 41, 55, 0.8)',
              color: currentFilter === 'byMember' ? 'white' : '#D1D5DB',
              boxShadow: currentFilter === 'byMember'
              ? '0 4px 12px rgba(59, 130, 246, 0.4)'
              : 'none',
            }}
            onMouseEnter={(e) => {
              if (currentFilter !== 'byMember') {
                e.currentTarget.style.background = 'rgba(55, 65, 81, 0.9)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentFilter !== 'byMember') {
                e.currentTarget.style.background = 'rgba(31, 41, 55, 0.8)';
              }
            }}
           >
            <span>👥</span>
            <span>By Member</span>
            {selectedMember && (
              <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.2)',
            }}>
              {truncateAddress(selectedMember)}
            </span>
           )}
           <svg style={{
            width: '1rem',
            height: '1rem',
            transition: 'transform 0.2s ease',
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
           }}
           fill='none'
           stroke="currentColor"
           viewBox="0 0 24 24"
           >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
           </svg>
          </button>

          {/* メンバー選択ドロップダウン */}
          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              zIndex: 50,
              top: 'calc(100% + 0.5rem)',
              left: 0,
              minWidth: '240px',
              maxHeight: '300px',
              overflowY: 'auto',
              background: 'linear-gradient(to bottom, rgba(31, 41, 55, 0.98), rgba(17, 24, 39, 0.98))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              borderRadius: '10px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
            }}>
              {members.length > 0 ? (
                members.map((member, index) => {
                  const memberTaskCount = filterCounts[member] || 0;
                  const isSelected = selectedMember === member;
                  return (
                    <button
                      key={member}
                      onClick={() => handleFilterSelect('byMember', member)}
                      title={member}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        transition: 'all 0.15s ease',
                        border: 'none',
                        borderBottom: index < members.length - 1 ? '1px solid rgba(55, 65, 81, 0.5)' : 'none',
                        cursor: 'pointer',
                        background: isSelected 
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))' 
                          : 'transparent',
                        color: isSelected ? 'white' : '#D1D5DB',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(55, 65, 81, 0.6)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>👤</span>
                          <span style={{ fontWeight: '500' }}>{truncateAddress(member)}</span>
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          background: isSelected 
                            ? 'rgba(255, 255, 255, 0.2)' 
                            : 'rgba(17, 24, 39, 0.6)',
                        }}>
                          {memberTaskCount}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  color: '#9CA3AF',
                }}>
                  No members available
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* フィルター情報表示 */}
      {(currentFilter === 'byMember' && selectedMember) && (
        <div style={{
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(55, 65, 81, 0.5)',
          fontSize: '0.8125rem',
          color: '#9CA3AF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>
            Showing tasks for <span style={{ color: '#60A5FA', fontWeight: '600' }}>{truncateAddress(selectedMember)}</span>
          </span>
          <button
            onClick={() => handleFilterSelect('all')}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#60A5FA',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
              e.currentTarget.style.color = '#93C5FD';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.color = '#60A5FA';
            }}
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};