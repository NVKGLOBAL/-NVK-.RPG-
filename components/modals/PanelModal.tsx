
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
}

const PanelModal: React.FC<PanelModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = '90%',
  height = '85vh',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
        aria-label="Close modal backdrop" 
      />
      <div 
        ref={modalRef}
        className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10"
        style={{ width, height, maxWidth: '1200px' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
          <h2 id="modal-title" className="text-lg font-['Cinzel'] font-bold text-slate-100 flex items-center gap-2">
            <i className="ri-layout-grid-fill text-indigo-500"></i>
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-slate-950/50 p-4 flex justify-center">
            {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PanelModal;
