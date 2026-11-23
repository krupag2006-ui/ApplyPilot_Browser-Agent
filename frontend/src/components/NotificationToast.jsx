import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
      {notifications.map((item) => {
        let bg = 'bg-[#FAF6F0] border-ivory-300 text-charcoal-900';
        let icon = <Info className="w-5 h-5 text-forest-700 shrink-0" />;

        if (item.type === 'success') {
          bg = 'bg-[#F2F8F5] border-[#C8E3D5] text-[#164330]';
          icon = <CheckCircle2 className="w-5 h-5 text-[#2C7B58] shrink-0" />;
        } else if (item.type === 'error') {
          bg = 'bg-[#FCF4F3] border-[#F4D1CD] text-[#7A2118]';
          icon = <AlertCircle className="w-5 h-5 text-[#C84A3B] shrink-0" />;
        }

        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-lg border shadow-card transition-all transform animate-in slide-in-from-bottom-3 ${bg}`}
          >
            <div className="flex items-start gap-2.5">
              {icon}
              <p className="text-sm font-medium leading-snug">{item.message}</p>
            </div>
            <button
              onClick={() => onDismiss(item.id)}
              className="text-charcoal-400 hover:text-charcoal-700 p-1 rounded-md"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
