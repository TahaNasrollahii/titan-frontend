'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icons';

interface Option {
  value: string;
  label: string;
  icon?: string;
  image?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'relative', width: '100%', userSelect: 'none' }}
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: isOpen ? 'rgba(226, 69, 63, 0.05)' : 'rgba(0, 0, 0, 0.3)',
          border: `1px solid ${isOpen ? 'var(--red)' : 'rgba(255, 255, 255, 0.1)'}`,
          boxShadow: isOpen ? '0 0 0 4px rgba(226, 69, 63, 0.1)' : 'none',
          padding: '16px 20px',
          borderRadius: '16px',
          color: '#fff',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {selectedOption?.image ? (
            <img src={selectedOption.image} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          ) : selectedOption?.icon ? (
            <Icon name={selectedOption.icon as any} />
          ) : null}
          {selectedOption ? selectedOption.label : placeholder || 'انتخاب کنید...'}
        </span>
        <div style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
          transition: 'transform 0.3s',
          display: 'flex',
          color: isOpen ? 'var(--red)' : 'rgba(255,255,255,0.4)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: 'rgba(20, 15, 17, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '8px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          animation: 'dropdownIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}>
          <style>{`
            @keyframes dropdownIn {
              from { opacity: 0; transform: translateY(-10px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: value === opt.value ? '#fff' : 'rgba(255,255,255,0.7)',
                background: value === opt.value ? 'rgba(226, 69, 63, 0.15)' : 'transparent',
                fontWeight: value === opt.value ? '600' : '400',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (value !== opt.value) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== opt.value) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                }
              }}
            >
              {opt.image ? (
                <img src={opt.image} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              ) : opt.icon ? (
                <Icon name={opt.icon as any} />
              ) : null}
              {opt.label}
              {value === opt.value && (
                <div style={{ marginLeft: 'auto', color: 'var(--red)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
