'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type) => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 3500);
    }, []);

    const showSuccess = useCallback((message) => addToast(message, 'success'), [addToast]);
    const showError = useCallback((message) => addToast(message, 'error'), [addToast]);
    const showInfo = useCallback((message) => addToast(message, 'info'), [addToast]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
            {children}
            
            <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => {
                    const isSuccess = toast.type === 'success';
                    const isError = toast.type === 'error';
                    const isInfo = toast.type === 'info';

                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto bg-white border border-slate-200/80 shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[280px] max-w-sm`}
                        >
                            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                            {isError && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                            {isInfo && <Info className="w-5 h-5 text-blue-500 shrink-0" />}
                            
                            <span className="flex-1 leading-snug">{toast.message}</span>
                            
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
