'use client';

import React, { useEffect, useState } from 'react';
import { useAppContext, Toast as ToastType } from '@/context/AppContext';
import { Icon } from './Icons';

function Toast({ toast, onRemove }: { toast: ToastType; onRemove: (id: number) => void }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => onRemove(toast.id), 450);
    }, 4300);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onRemove(toast.id), 450);
  };

  return (
    <div className={`toast ${isClosing ? 'out' : ''}`}>
      <span className="t-ic">
        <Icon name={toast.icon || 'bell'} />
      </span>
      <div>
        <b>{toast.title}</b>
        {toast.text && <span className="tx">{toast.text}</span>}
      </div>
      <button className="t-close" aria-label="بستن" onClick={handleClose}>
        <Icon name="x" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="toasts" id="toasts" aria-live="polite">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
