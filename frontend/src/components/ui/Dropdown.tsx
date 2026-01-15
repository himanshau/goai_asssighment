import { useState, useRef, useEffect, ReactNode } from 'react';

interface DropdownOption {
    value: string;
    label: string;
    icon?: ReactNode;
}

interface DropdownProps {
    options: DropdownOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    className?: string;
}

export default function Dropdown({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    label,
    disabled = false,
    className = ''
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (isOpen) {
                    onChange(options[highlightedIndex].value);
                    setIsOpen(false);
                } else {
                    setIsOpen(true);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (isOpen) {
                    setHighlightedIndex(prev =>
                        prev < options.length - 1 ? prev + 1 : prev
                    );
                } else {
                    setIsOpen(true);
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (isOpen) {
                    setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    return (
        <div className={`w-full ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    className={`
            w-full flex items-center justify-between gap-2 bg-slate-800 border rounded-lg px-4 py-3 text-left
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500
            ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-slate-700'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-600'}
          `}
                >
                    <span className={`flex items-center gap-2 ${selectedOption ? 'text-white' : 'text-slate-500'}`}>
                        {selectedOption?.icon}
                        {selectedOption?.label || placeholder}
                    </span>
                    <svg
                        className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {options.map((option, index) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className={`
                  w-full flex items-center gap-2 px-4 py-3 text-left transition-colors
                  ${highlightedIndex === index ? 'bg-slate-700 text-white' : 'text-slate-300'}
                  ${option.value === value ? 'text-indigo-400' : ''}
                  hover:bg-slate-700 hover:text-white
                `}
                            >
                                {option.icon}
                                {option.label}
                                {option.value === value && (
                                    <svg className="w-4 h-4 ml-auto text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
