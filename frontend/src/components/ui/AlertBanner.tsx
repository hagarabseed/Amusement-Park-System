import React from 'react';

interface AlertBannerProps {
  errorMsg: string | null;
  successMsg: string | null;
  onDismiss: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ errorMsg, successMsg, onDismiss }) => {
  if (!errorMsg && !successMsg) return null;

  return (
    <div className="space-y-2">
      {errorMsg && (
        <div
          data-testid="alert-error"
          role="alert"
          className="flex items-start justify-between gap-3 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-sm shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">Error:</span>
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="text-rose-500 hover:text-rose-800 font-semibold text-xs px-1.5 py-0.5 rounded"
          >
            Dismiss
          </button>
        </div>
      )}
      {successMsg && (
        <div
          data-testid="alert-success"
          role="status"
          className="flex items-start justify-between gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm shadow-sm"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">Success:</span>
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss message"
            className="text-emerald-600 hover:text-emerald-900 font-semibold text-xs px-1.5 py-0.5 rounded"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
