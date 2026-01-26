import { useState, useRef, useEffect } from 'react';

interface MemberSelectorProps {
  members: string[];
  value: string | null;
  onChange: (address: string | null) => void;
  allowUnassigned?: boolean;
  label?: string;
  disabled?: boolean;
}

/**
 * ウォレットアドレスを短縮形で表示
 * 例: 0x1234567890abcdef1234567890abcdef → 0x1234...cdef
 */
const truncateAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

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

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>

      {/* ドロップダウンボタン */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left rounded-md border
          bg-gray-800 border-gray-600 text-gray-100
          hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors flex justify-between items-center
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span>{displayValue}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg">
          {/* Unassigned オプション */}
          {allowUnassigned && (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`
                w-full px-3 py-2 text-left text-sm
                hover:bg-gray-700 transition-colors
                ${value === null ? 'bg-blue-600 text-white' : 'text-gray-300'}
                border-b border-gray-700
              `}
            >
              ✨ Unassigned
            </button>
          )}

          {/* メンバーオプション */}
          {members.length > 0 ? (
            members.map((member, index) => (
              <button
                key={member}
                type="button"
                onClick={() => handleSelect(member)}
                className={`
                  w-full px-3 py-2 text-left text-sm
                  hover:bg-gray-700 transition-colors
                  ${value === member ? 'bg-blue-600 text-white' : 'text-gray-300'}
                  ${index < members.length - 1 ? 'border-b border-gray-700' : ''}
                `}
                title={member}
              >
                👤 {truncateAddress(member)}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              No members available
            </div>
          )}
        </div>
      )}

      {/* フルアドレス表示（オプション） */}
      {value && (
        <p className="text-xs text-gray-500 mt-1 break-all">
          {value}
        </p>
      )}
    </div>
  );
}