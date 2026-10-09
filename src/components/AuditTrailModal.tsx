import React from 'react';
import {
  X,
  FileText,
  Download,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AuditLogItem } from '../types/disaster';

interface AuditTrailModalProps {
  logs: AuditLogItem[];
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  logs,
  onClose
}) => {
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `disasterlens-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-750 rounded-xl shadow-2xl p-6 text-slate-100 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Command Decision Audit Trail
              </h2>
              <span className="text-[11px] text-slate-400">
                Immutable record of operator interventions and resource authorizations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              title="Export as JSON"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="flex-1 overflow-y-auto space-y-2 text-xs">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No operator actions logged in current session.
            </div>
          ) : (
            logs.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{item.action}</span>
                    <span className="text-[10px] text-rose-400 font-mono bg-rose-950/60 border border-rose-900/60 px-1.5 py-0.2 rounded">
                      {item.actor}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{item.details}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-[11px] text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Total Logged Interventions: {logs.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
