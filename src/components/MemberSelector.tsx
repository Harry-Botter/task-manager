import { useState, useRef, useEffect } from "react";

interface MemberSelectorProps {
    members: string[]; // ウォレットアドレスの配列
    value: string | null;
    onChange: (address: string | null) => void;
    allowUnassigned?: boolean;
    label?: string;
    disabled: boolean;
}

/* ウォレットアドレスが長いから短縮して表示する */
const truncateAddress = (address: string): string => {
    if(!address || address.length < 10) return address;
    return `${address.slice(0,6)}...${address.slice(-4)}`;
};

export const MemberSelector = ({
    members,
    value,
    onChange,
    allowUnassigned = true,
    label = 'Assigned To',
    disabled = false,
}: MemberSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

// ドロップダウン外をクリックすると閉じる
useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if(dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <button
         onClick={()=> setIsOpen(!isOpen)}
         disabled={disabled}
         className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed flex justify-between items-center">
            <span>{displayValue}</span>
            <svg
             className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
             fill="none"
             stroke="currentColor"
             viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        </button>
        {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {allowUnassigned && (
                    <button
                     onClick={()=> handleSelect(null)}
                     className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${value === null ? 'bg-blue-50 text-blue-600' : ''}`}
                     >
                        Unassigned
                    </button>
                )}
                {members.map((member) => (
                    <button
                     key={member}
                     onClick={()=> handleSelect(member)}
                     >
                        {truncateAddress(member)}
                    </button>
                ))}
            </div>
        )}
    </div>
);
};