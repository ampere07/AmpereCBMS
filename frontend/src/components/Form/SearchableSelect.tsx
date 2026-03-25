import React, { useState, useRef, useEffect } from 'react';

interface Option {
  id: number | string;
  name: string;
  code?: string;
}

interface SearchableSelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  required = false,
  style,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => String(opt.code || opt.id) === String(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: Option) => {
    const syntheticEvent = {
      target: {
        name,
        value: String(option.code || option.id)
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    onChange(syntheticEvent);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={`w-full border rounded px-3 py-2 cursor-pointer flex justify-between items-center ${disabled ? 'opacity-50 cursor-not-allowed text-gray-400' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          borderColor: style?.borderColor || '#E5E7EB',
          backgroundColor: style?.backgroundColor || '#FFFFFF',
          color: style?.color || '#1F2937'
        }}
      >
        <span className={!selectedOption ? 'text-gray-400' : ''}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col"
          style={{
            borderColor: style?.borderColor || '#E5E7EB',
            backgroundColor: style?.backgroundColor || '#FFFFFF'
          }}
        >
          <div className="p-2 border-b" style={{ borderColor: style?.borderColor || '#E5E7EB' }}>
            <input
              type="text"
              autoFocus
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: style?.backgroundColor || '#FFFFFF',
                color: style?.color || '#1F2937',
                borderColor: style?.borderColor || '#E5E7EB'
              }}
            />
          </div>
          <div className="overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.id}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors text-sm"
                  onClick={() => handleSelect(option)}
                  style={{ color: style?.color || '#1F2937' }}
                >
                  {option.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No results found</div>
            )}
          </div>
        </div>
      )}
      
      {/* Hidden select for form compatibility if needed */}
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="hidden"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.id} value={String(option.code || option.id)}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SearchableSelect;
