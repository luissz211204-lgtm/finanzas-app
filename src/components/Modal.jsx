import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  const overlay = useRef();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
      onClick={(e) => { if (e.target === overlay.current) onClose(); }}
    >
      <div className={`w-full ${sizes[size] || sizes.md} animate-scale-in`}>
        <div className="glass rounded-2xl border border-dark-600 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-dark-600 px-5 py-4">
            <h2 className="text-lg font-semibold text-dark-50">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-dark-400 hover:bg-dark-600 hover:text-dark-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
