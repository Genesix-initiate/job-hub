import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-3">
      <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
      <span className="text-xs font-medium tracking-wide">{message}</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl max-w-lg mx-auto my-6">
      <div className="h-12 w-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="w-6 h-6 text-emerald-400" />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-500/10"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
