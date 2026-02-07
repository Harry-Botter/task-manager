import { useState } from 'react';
import { Task } from '../lib/types';
import { truncateAddress, addressesEqual } from '../lib/utils';

interface MemberListProps {
  members: string[];
  tasks: Task[];
  onAddMember: (address: string) => void;
  currentUserAddress?: string;
}

export default function MemberList({
  members,
  tasks,
  onAddMember,
  currentUserAddress,
}: MemberListProps) {
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  /**
   * メンバーのタスク数を計算
   * ✅ アドレス正規化を適用
   */
  const getMemberTaskCount = (memberAddress: string): number => {
    return tasks.filter((t) => addressesEqual(t.assignedTo, memberAddress)).length;
  };

  /**
   * メンバー追加処理
   * ✅ 入力検証を強化
   */
  const handleAddMember = () => {
    const trimmed = newMemberAddress.trim();

    // 1. 空チェック
    if (!trimmed) {
      setError('Please enter an address');
      return;
    }

    // 2. Sui アドレス形式チェック（0x + 40~64文字の16進数）
    if (!trimmed.startsWith('0x') || trimmed.length < 42) {
      setError('Invalid address format. Expected: 0x + 40+ hex characters');
      return;
    }

    // 3. 16進数チェック
    if (!/^0x[0-9a-fA-F]{40,64}$/.test(trimmed)) {
      setError('Invalid address. Must contain only hex characters (0-9, a-f)');
      return;
    }

    // 4. 重複チェック（アドレス正規化して比較）
    if (members.some(m => addressesEqual(m, trimmed))) {
      setError('This member is already in the project');
      return;
    }

    // 5. 現在のユーザーと同じ場合
    if (currentUserAddress && addressesEqual(trimmed, currentUserAddress)) {
      setError('You cannot add yourself');
      return;
    }

    // OK: 追加処理
    onAddMember(trimmed);
    setNewMemberAddress('');
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddMember();
    }
  };

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: '#111827',
      borderRadius: '0.5rem',
      marginBottom: '1.5rem',
    }}>
      {/* ヘッダー */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>👥</span>
          <span>Members ({members.length})</span>
        </h3>
      </div>

      {/* メンバーリスト */}
      <div style={{ marginBottom: '1rem' }}>
        {members.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {members.map((member) => {
              const taskCount = getMemberTaskCount(member);
              const isCurrentUser = addressesEqual(member, currentUserAddress);

              return (
                <li
                  key={member}
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    backgroundColor: '#1F2937',
                    border: isCurrentUser ? '2px solid #3B82F6' : '1px solid #374151',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem' }}>👤</span>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'white',
                    }}>
                      {truncateAddress(member)}
                      {isCurrentUser && (
                        <span style={{
                          marginLeft: '0.5rem',
                          padding: '0.125rem 0.5rem',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          borderRadius: '0.25rem',
                          fontSize: '0.65rem',
                          fontWeight: '600',
                        }}>
                          YOU
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#9CA3AF',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#111827',
                    borderRadius: '0.25rem',
                  }}>
                    {taskCount} task{taskCount !== 1 ? 's' : ''}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div style={{
            padding: '1rem',
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '0.875rem',
          }}>
            No members yet. Add one to get started!
          </div>
        )}
      </div>

      {/* メンバー追加フォーム */}
      <div style={{
        paddingTop: '1rem',
        borderTop: '1px solid #374151',
      }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#9CA3AF',
          marginBottom: '0.5rem',
        }}>
          ➕ Add Member
        </label>

        <div style={{
          display: 'flex',
          gap: '0.5rem',
        }}>
          <input
            type="text"
            value={newMemberAddress}
            onChange={(e) => {
              setNewMemberAddress(e.target.value);
              setError(null);
            }}
            onKeyPress={handleKeyPress}
            placeholder="0x..."
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              backgroundColor: '#111827',
              border: error ? '2px solid #EF4444' : '1px solid #374151',
              borderRadius: '0.375rem',
              color: 'white',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
          <button
            onClick={handleAddMember}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10B981')}
          >
            Add
          </button>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: '#7F1D1D',
            color: '#FCA5A5',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}