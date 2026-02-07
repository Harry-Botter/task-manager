import { useState, useRef, useEffect } from 'react';
import { truncateAddress, addressesEqual } from '../lib/utils';

interface MemberSelectorProps {
  members: string[];
  value: string | null;
  onChange: (address: string | null) => void;
  allowUnassigned?: boolean;
  label?: string;
  disabled?: boolean;
}

export default function MemberSelector({
  members,
  value,
  onChange,
  allowUnassigned = true,
  label = 'Assigned To',
  disabled = false,
}: MemberSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ドロップダウン外をクリックすると閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (address: string | null) => {
    onChange(address);
    setIsOpen(false);
  };

  const displayValue = value ? truncateAddress(value) : 'Unassigned';
  const displayIcon = value ? '👤' : '✨';

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <label style={{
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
        color: '#D1D5DB',
        marginBottom: '0.5rem',
      }}>
        {label}
      </label>

      {/* ドロップダウンボタン */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          textAlign: 'left',
          borderRadius: '8px',
          border: '2px solid',
          borderColor: isOpen ? '#3B82F6' : '#374151',
          background: 'linear-gradient(to bottom, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95))',
          color: '#F9FAFB',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s ease',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          outline: 'none',
          fontWeight: '500',
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isOpen) {
            e.currentTarget.style.borderColor = '#4B5563';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isOpen) {
            e.currentTarget.style.borderColor = '#374151';
          }
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem' }}>{displayIcon}</span>
          <span>{displayValue}</span>
        </span>
        <svg
          style={{
            width: '1rem',
            height: '1rem',
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          zIndex: 50,
          width: '100%',
          marginTop: '0.5rem',
          background: 'linear-gradient(to bottom, rgba(31, 41, 55, 0.98), rgba(17, 24, 39, 0.98))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(75, 85, 99, 0.5)',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}>
          {/* Unassigned オプション */}
          {allowUnassigned && (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                transition: 'all 0.15s ease',
                border: 'none',
                borderBottom: '1px solid rgba(55, 65, 81, 0.5)',
                cursor: 'pointer',
                background: !value
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3))' 
                  : 'transparent',
                color: !value ? 'white' : '#D1D5DB',
                fontWeight: !value ? '600' : '400',
              }}
              onMouseEnter={(e) => {
                if (value !== null) {
                  e.currentTarget.style.background = 'rgba(55, 65, 81, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== null) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>✨</span>
                <span>Unassigned</span>
              </span>
            </button>
          )}

          {/* メンバーオプション */}
          {members.length > 0 ? (
            members.map((member, index) => {
              const isSelected = addressesEqual(value, member);
              return (
                <button
                  key={member}
                  type="button"
                  onClick={() => handleSelect(member)}
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
                    fontWeight: isSelected ? '600' : '400',
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>👤</span>
                    <span>{truncateAddress(member)}</span>
                  </span>
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
  );
}